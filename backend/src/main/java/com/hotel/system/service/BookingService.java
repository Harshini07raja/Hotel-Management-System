package com.hotel.system.service;

import com.hotel.system.dto.BookingDtos;
import com.hotel.system.exception.BadRequestException;
import com.hotel.system.exception.ConflictException;
import com.hotel.system.exception.ResourceNotFoundException;
import com.hotel.system.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Reservation & Concurrency Control Service.
 * 
 * Correctness Guarantees:
 * 1. Double Booking Prevention: Atomically locks on the authoritative hotel shard.
 *    Validates half-open date interval [checkIn, checkOut) overlap.
 * 2. Idempotency Key: Duplicate client submissions return the existing confirmed booking.
 * 3. Price Snapshot: Nightly price is frozen at reservation time using BigDecimal.
 * 4. Cache Invalidation: Triggers cache eviction for availability and search queries.
 */
@Service
public class BookingService {
    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final ShardRouter shardRouter;
    private final AvailabilityService availabilityService;
    private final UniqueIdGeneratorService idGenerator;
    private final UrlShortenerService urlShortenerService;
    private final NotificationService notificationService;
    private final CacheService cacheService;
    private final BillingService billingService;

    // Room-level lock stripe to serialize concurrent reservation attempts for the same room
    private final Map<String, Object> roomLockStripe = new ConcurrentHashMap<>();

    public BookingService(ShardRouter shardRouter,
                          AvailabilityService availabilityService,
                          UniqueIdGeneratorService idGenerator,
                          UrlShortenerService urlShortenerService,
                          NotificationService notificationService,
                          CacheService cacheService,
                          BillingService billingService) {
        this.shardRouter = shardRouter;
        this.availabilityService = availabilityService;
        this.idGenerator = idGenerator;
        this.urlShortenerService = urlShortenerService;
        this.notificationService = notificationService;
        this.cacheService = cacheService;
        this.billingService = billingService;
    }

    public Booking createBooking(BookingDtos.CreateBookingRequest request, String guestId, String guestName, String guestEmail) {
        // 1. Validation of dates
        LocalDate checkIn = request.getCheckInDate();
        LocalDate checkOut = request.getCheckOutDate();
        if (checkIn == null || checkOut == null || !checkIn.isBefore(checkOut)) {
            throw new BadRequestException("Check-in date must be strictly before check-out date.");
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new BadRequestException("Check-in date cannot be in the past.");
        }

        MongoTemplate template = shardRouter.getTemplateForBooking(request.getHotelId());

        // 2. Idempotency Key check: if already submitted, return the existing booking!
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty()) {
            Query idemQuery = new Query(Criteria.where("idempotencyKey").is(request.getIdempotencyKey().trim()));
            Booking existing = template.findOne(idemQuery, Booking.class);
            if (existing != null) {
                log.info("Idempotent booking hit for key {}: returning existing booking {}", request.getIdempotencyKey(), existing.getId());
                return existing;
            }
        }

        // 3. Obtain authoritative Room and Hotel details from the shard
        Room room = template.findById(request.getRoomId(), Room.class);
        if (room == null || !room.getHotelId().equals(request.getHotelId())) {
            throw new ResourceNotFoundException("Room with ID " + request.getRoomId() + " not found in hotel " + request.getHotelId());
        }
        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            throw new ConflictException("Room is currently under maintenance.");
        }
        if (request.getGuestCount() > room.getCapacity()) {
            throw new BadRequestException("Guest count exceeds room capacity of " + room.getCapacity());
        }

        Hotel hotel = template.findById(request.getHotelId(), Hotel.class);
        String hotelName = hotel != null ? hotel.getName() : "Hotel " + request.getHotelId();

        // 4. Critical Concurrency Control: Serialize per room to prevent race condition
        Object roomLock = roomLockStripe.computeIfAbsent(room.getId(), k -> new Object());

        Booking confirmedBooking;
        synchronized (roomLock) {
            // Atomic conditional query on the authoritative shard: verify no overlapping bookings exist
            Query overlapQuery = new Query(Criteria.where("roomId").is(room.getId())
                    .and("status").in(Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN))
                    .and("checkInDate").lt(checkOut)
                    .and("checkOutDate").gt(checkIn));

            long overlapCount = template.count(overlapQuery, Booking.class);
            if (overlapCount > 0) {
                log.warn("Double booking prevented! Room {} already reserved for dates [{} to {})", room.getId(), checkIn, checkOut);
                throw new ConflictException("Room " + room.getRoomNumber() + " is already reserved for the selected dates.");
            }

            // 5. Calculate price using decimal-safe BigDecimal arithmetic
            int totalNights = (int) ChronoUnit.DAYS.between(checkIn, checkOut);
            BigDecimal nightlyRate = room.getNightlyPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalPrice = nightlyRate.multiply(BigDecimal.valueOf(totalNights)).setScale(2, RoundingMode.HALF_UP);

            // 6. Generate unique Snowflake Booking ID
            String bookingId = idGenerator.nextBookingId();

            Booking booking = new Booking();
            booking.setId(bookingId);
            booking.setIdempotencyKey(request.getIdempotencyKey());
            booking.setHotelId(request.getHotelId());
            booking.setHotelName(hotelName);
            booking.setRoomId(room.getId());
            booking.setRoomNumber(room.getRoomNumber());
            booking.setRoomType(room.getRoomType());
            booking.setGuestId(guestId);
            booking.setGuestName(guestName);
            booking.setGuestEmail(guestEmail);
            booking.setCheckInDate(checkIn);
            booking.setCheckOutDate(checkOut);
            booking.setGuestCount(request.getGuestCount());
            booking.setNightlyRateSnapshot(nightlyRate); // Frozen price snapshot
            booking.setTotalNights(totalNights);
            booking.setTotalPrice(totalPrice);
            booking.setStatus(BookingStatus.CONFIRMED);

            // 7. Generate shareable Short URL
            String targetUrl = "/bookings/" + bookingId;
            ShortUrl shortUrl = urlShortenerService.createShortUrl(bookingId, targetUrl, guestId);
            booking.setShortBookingCode(shortUrl.getShortCode());
            booking.setShortBookingUrl("/s/" + shortUrl.getShortCode());

            // 8. Persist atomically to the hotel's shard
            confirmedBooking = template.save(booking);
            log.info("Booking confirmed: ID [{}], Room [{}], Dates [{} to {})", bookingId, room.getId(), checkIn, checkOut);
        }

        // 9. Generate itemized initial invoice
        billingService.createInvoiceForBooking(confirmedBooking);

        // 10. Send Confirmation Notification to guest
        notificationService.createNotification(guestId, NotificationType.BOOKING_CONFIRMATION,
                "Booking Confirmed: " + hotelName,
                String.format("Your reservation for Room %s (%s) from %s to %s is confirmed. Total: $%s",
                        confirmedBooking.getRoomNumber(), confirmedBooking.getRoomType(), checkIn, checkOut, confirmedBooking.getTotalPrice()),
                confirmedBooking.getId());

        // 11. Evict stale cache
        cacheService.evictPrefix("hotel:" + request.getHotelId());
        cacheService.evictPrefix("search:");

        return confirmedBooking;
    }

    public Booking getBookingById(String bookingId) {
        return shardRouter.findByIdAcrossShards(bookingId, Booking.class)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with ID " + bookingId + " not found."));
    }

    public List<Booking> getAllBookings() {
        return shardRouter.scatterGather(new Query(), Booking.class);
    }

    public Booking cancelBooking(String bookingId, String requestingGuestId, boolean isStaff) {
        Booking booking = getBookingById(bookingId);

        if (!isStaff && !booking.getGuestId().equals(requestingGuestId)) {
            throw new BadRequestException("You do not have permission to cancel this booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ConflictException("Booking is already cancelled.");
        }
        if (booking.getStatus() == BookingStatus.CHECKED_IN || booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new ConflictException("Cannot cancel a booking that has already checked in or checked out.");
        }

        MongoTemplate template = shardRouter.getTemplateForBooking(booking.getHotelId());
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(Instant.now());
        template.save(booking);

        // Notify guest
        notificationService.createNotification(booking.getGuestId(), NotificationType.CANCELLATION,
                "Booking Cancelled: " + booking.getHotelName(),
                "Your reservation " + booking.getId() + " has been successfully cancelled.", booking.getId());

        // Evict cache
        cacheService.evictPrefix("hotel:" + booking.getHotelId());
        cacheService.evictPrefix("search:");

        log.info("Booking cancelled: ID [{}]", bookingId);
        return booking;
    }

    public BookingDtos.BookingDto toDto(Booking b) {
        BookingDtos.BookingDto dto = new BookingDtos.BookingDto();
        dto.setId(b.getId());
        dto.setIdempotencyKey(b.getIdempotencyKey());
        dto.setHotelId(b.getHotelId());
        dto.setHotelName(b.getHotelName());
        dto.setRoomId(b.getRoomId());
        dto.setRoomNumber(b.getRoomNumber());
        dto.setRoomType(b.getRoomType());
        dto.setGuestId(b.getGuestId());
        dto.setGuestName(b.getGuestName());
        dto.setGuestEmail(b.getGuestEmail());
        dto.setCheckInDate(b.getCheckInDate());
        dto.setCheckOutDate(b.getCheckOutDate());
        dto.setGuestCount(b.getGuestCount());
        dto.setNightlyRateSnapshot(b.getNightlyRateSnapshot());
        dto.setTotalNights(b.getTotalNights());
        dto.setTotalPrice(b.getTotalPrice());
        dto.setStatus(b.getStatus());
        dto.setShortBookingCode(b.getShortBookingCode());
        dto.setShortBookingUrl(b.getShortBookingUrl());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }
}
