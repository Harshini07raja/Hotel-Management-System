package com.hotel.system.service;

import com.hotel.system.dto.BookingDtos;
import com.hotel.system.exception.ConflictException;
import com.hotel.system.exception.ResourceNotFoundException;
import com.hotel.system.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Check-In and Check-Out Operations Service.
 * Manages operational room transitions, staff workflows, and housekeeping task dispatch.
 */
@Service
public class CheckInCheckOutService {
    private static final Logger log = LoggerFactory.getLogger(CheckInCheckOutService.class);

    private final ShardRouter shardRouter;
    private final BookingService bookingService;
    private final HousekeepingService housekeepingService;
    private final BillingService billingService;
    private final NotificationService notificationService;
    private final CacheService cacheService;

    public CheckInCheckOutService(ShardRouter shardRouter,
                                  BookingService bookingService,
                                  HousekeepingService housekeepingService,
                                  BillingService billingService,
                                  NotificationService notificationService,
                                  CacheService cacheService) {
        this.shardRouter = shardRouter;
        this.bookingService = bookingService;
        this.housekeepingService = housekeepingService;
        this.billingService = billingService;
        this.notificationService = notificationService;
        this.cacheService = cacheService;
    }

    public Booking checkIn(String bookingId, String staffName) {
        Booking booking = bookingService.getBookingById(bookingId);

        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            throw new ConflictException("Guest is already checked in for booking " + bookingId);
        }
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ConflictException("Booking cannot be checked in. Current status: " + booking.getStatus());
        }

        MongoTemplate template = shardRouter.getTemplateForBooking(booking.getHotelId());

        // Update room status to OCCUPIED
        Room room = template.findById(booking.getRoomId(), Room.class);
        if (room != null) {
            room.setStatus(RoomStatus.OCCUPIED);
            room.setUpdatedAt(Instant.now());
            template.save(room);
        }

        // Update booking status
        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setUpdatedAt(Instant.now());
        template.save(booking);

        // Notify guest
        notificationService.createNotification(booking.getGuestId(), NotificationType.CHECK_IN,
                "Check-In Confirmed",
                String.format("Welcome! You have checked into Room %s at %s.", booking.getRoomNumber(), booking.getHotelName()),
                booking.getId());

        // Evict cache
        cacheService.evictPrefix("hotel:" + booking.getHotelId());
        log.info("Check-in completed for booking [{}] by staff [{}]", bookingId, staffName);
        return booking;
    }

    public BookingDtos.CheckOutResponse checkOut(String bookingId, String staffName) {
        Booking booking = bookingService.getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new ConflictException("Booking is not in CHECKED_IN status (current: " + booking.getStatus() + ")");
        }

        MongoTemplate template = shardRouter.getTemplateForBooking(booking.getHotelId());

        // 1. Update Room: status to AVAILABLE, housekeepingStatus to DIRTY
        Room room = template.findById(booking.getRoomId(), Room.class);
        if (room != null) {
            room.setStatus(RoomStatus.AVAILABLE);
            room.setHousekeepingStatus(HousekeepingStatus.DIRTY);
            room.setUpdatedAt(Instant.now());
            template.save(room);

            // 2. Automatically dispatch Housekeeping Task
            housekeepingService.createTask(
                    booking.getHotelId(), room.getId(), room.getRoomNumber(),
                    HousekeepingStatus.DIRTY, "Routine cleaning after checkout for booking " + bookingId
            );
        }

        // 3. Update booking status to CHECKED_OUT
        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setUpdatedAt(Instant.now());
        template.save(booking);

        // 4. Retrieve invoice
        Invoice invoice = billingService.getInvoiceByBookingId(bookingId);

        // 5. Notify guest
        notificationService.createNotification(booking.getGuestId(), NotificationType.CHECK_OUT,
                "Check-Out Complete",
                String.format("Thank you for staying at %s. Your final invoice total is $%s.",
                        booking.getHotelName(), invoice.getTotalAmount()),
                booking.getId());

        // 6. Evict cache
        cacheService.evictPrefix("hotel:" + booking.getHotelId());
        log.info("Check-out completed for booking [{}] by staff [{}]", bookingId, staffName);

        return new BookingDtos.CheckOutResponse(
                booking.getId(), invoice.getId(), invoice.getTotalAmount(),
                invoice.getPaymentStatus().name(), "Check-out completed. Room scheduled for housekeeping."
        );
    }
}
