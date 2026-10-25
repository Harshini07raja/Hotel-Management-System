package com.hotel.system;

import com.hotel.system.dto.BookingDtos;
import com.hotel.system.exception.ConflictException;
import com.hotel.system.model.*;
import com.hotel.system.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

public class BookingConcurrencyIntegrationTest {

    @Test
    @DisplayName("Half-Open date interval math: checking out on date D allows new check-in on date D")
    public void testHalfOpenIntervalNoOverlap() {
        LocalDate checkIn1 = LocalDate.of(2026, 11, 1);
        LocalDate checkOut1 = LocalDate.of(2026, 11, 5);

        LocalDate checkIn2 = LocalDate.of(2026, 11, 5); // Check in on previous guest's checkout date
        LocalDate checkOut2 = LocalDate.of(2026, 11, 8);

        // Condition for overlap: A_in < B_out && A_out > B_in
        boolean overlaps = checkIn1.isBefore(checkOut2) && checkOut1.isAfter(checkIn2);
        assertFalse(overlaps, "Adjacent half-open intervals [1, 5) and [5, 8) must NOT overlap!");
    }

    @Test
    @DisplayName("Half-Open date interval math: overlapping dates are correctly identified")
    public void testHalfOpenIntervalOverlap() {
        LocalDate checkIn1 = LocalDate.of(2026, 11, 1);
        LocalDate checkOut1 = LocalDate.of(2026, 11, 5);

        LocalDate checkIn2 = LocalDate.of(2026, 11, 4); // 1 night overlap on Nov 4
        LocalDate checkOut2 = LocalDate.of(2026, 11, 8);

        boolean overlaps = checkIn1.isBefore(checkOut2) && checkOut1.isAfter(checkIn2);
        assertTrue(overlaps, "Intervals [1, 5) and [4, 8) must be flagged as overlapping!");
    }

    @Test
    @DisplayName("Concurrent booking test: 30 parallel threads attempt to book the SAME single room on overlapping dates -> exactly 1 succeeds, 29 fail")
    public void testConcurrentRoomBookingLock() throws InterruptedException {
        ShardRouter shardRouter = new ShardRouter();
        shardRouter.init();

        AvailabilityService availabilityService = new AvailabilityService(shardRouter);
        UniqueIdGeneratorService idGenerator = new UniqueIdGeneratorService(1, 1);
        CacheService cacheService = new CacheService();
        NotificationService notificationService = new NotificationService(shardRouter, idGenerator);
        UrlShortenerService urlShortenerService = new UrlShortenerService(shardRouter, cacheService, idGenerator);
        BillingService billingService = new BillingService(shardRouter, idGenerator, notificationService);

        // Initialize BookingService
        BookingService bookingService = new BookingService(
                shardRouter, availabilityService, idGenerator, urlShortenerService,
                notificationService, cacheService, billingService
        );

        // Ensure room exists in shard-0 cleanly
        MongoTemplate template0 = shardRouter.getTemplateForHotel("HTL-101");
        template0.getCollection("rooms").deleteOne(new org.bson.Document("_id", "RM-TEST-CONCURRENCY-101"));
        Room testRoom = new Room("RM-TEST-CONCURRENCY-101", "HTL-101", "999", RoomType.SUITE, 2, BigDecimal.valueOf(300), List.of("WiFi"));
        testRoom.setStatus(RoomStatus.AVAILABLE);
        template0.save(testRoom);

        // Delete any existing bookings for this test room
        template0.getCollection("bookings").deleteMany(new org.bson.Document("roomId", testRoom.getId()));

        int threadCount = 30;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        List<Booking> confirmedBookings = new CopyOnWriteArrayList<>();

        LocalDate checkIn = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(14);

        for (int i = 0; i < threadCount; i++) {
            final int guestNum = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    BookingDtos.CreateBookingRequest req = new BookingDtos.CreateBookingRequest();
                    req.setHotelId("HTL-101");
                    req.setRoomId(testRoom.getId());
                    req.setCheckInDate(checkIn);
                    req.setCheckOutDate(checkOut);
                    req.setGuestCount(2);

                    Booking booking = bookingService.createBooking(
                            req, "GST-" + guestNum, "Guest " + guestNum, "guest" + guestNum + "@test.com"
                    );
                    confirmedBookings.add(booking);
                    successCount.incrementAndGet();
                } catch (ConflictException e) {
                    conflictCount.incrementAndGet();
                } catch (Exception e) {
                    // unexpected error
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        // Fire all threads simultaneously
        startLatch.countDown();
        boolean finished = finishLatch.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finished, "Concurrent booking test should complete within 15 seconds");

        // Rigorous distributed consistency assertions:
        assertEquals(1, successCount.get(), "EXACTLY ONE booking must succeed for the single room on overlapping dates!");
        assertEquals(29, conflictCount.get(), "All other 29 concurrent requests must be rejected with ConflictException (409)!");
        assertEquals(1, confirmedBookings.size(), "Only 1 confirmed booking record should exist!");
    }
}
