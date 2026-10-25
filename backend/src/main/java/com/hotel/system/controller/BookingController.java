package com.hotel.system.controller;

import com.hotel.system.dto.BookingDtos;
import com.hotel.system.model.Booking;
import com.hotel.system.model.Guest;
import com.hotel.system.model.Role;
import com.hotel.system.service.AuthenticationService;
import com.hotel.system.service.BookingService;
import com.hotel.system.service.CheckInCheckOutService;
import com.hotel.system.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Bookings", description = "Reservation lifecycle, concurrency control, check-in, and check-out APIs")
public class BookingController {

    private final BookingService bookingService;
    private final CheckInCheckOutService checkInCheckOutService;
    private final AuthenticationService authService;
    private final MetricsService metricsService;

    public BookingController(BookingService bookingService,
                             CheckInCheckOutService checkInCheckOutService,
                             AuthenticationService authService,
                             MetricsService metricsService) {
        this.bookingService = bookingService;
        this.checkInCheckOutService = checkInCheckOutService;
        this.authService = authService;
        this.metricsService = metricsService;
    }

    @PostMapping
    @Operation(summary = "Create a confirmed reservation with double-booking protection and idempotency")
    public ResponseEntity<BookingDtos.BookingDto> createBooking(
            @Valid @RequestBody BookingDtos.CreateBookingRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyHeader,
            @AuthenticationPrincipal String guestId) {

        long start = System.currentTimeMillis();
        if (idempotencyHeader != null && !idempotencyHeader.trim().isEmpty()) {
            request.setIdempotencyKey(idempotencyHeader.trim());
        }

        Guest guest = authService.getGuestById(guestId);
        Booking booking = bookingService.createBooking(request, guest.getId(), guest.getName(), guest.getEmail());

        metricsService.recordRequest("/api/v1/bookings", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(bookingService.toDto(booking));
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get booking details by ID")
    public ResponseEntity<BookingDtos.BookingDto> getBookingById(
            @PathVariable String bookingId,
            @AuthenticationPrincipal String currentUserId,
            Authentication authentication) {

        long start = System.currentTimeMillis();
        Booking booking = bookingService.getBookingById(bookingId);

        boolean isStaff = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_RECEPTIONIST"));

        // Authorization check: only owner or staff can view private reservation details!
        if (!isStaff && !booking.getGuestId().equals(currentUserId)) {
            return ResponseEntity.status(403).build();
        }

        metricsService.recordRequest("/api/v1/bookings/" + bookingId, System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(bookingService.toDto(booking));
    }

    @GetMapping
    @Operation(summary = "List all bookings (Staff/Admin only)")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<List<BookingDtos.BookingDto>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        List<BookingDtos.BookingDto> dtos = bookings.stream().map(bookingService::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{bookingId}/cancel")
    @Operation(summary = "Cancel a confirmed booking")
    public ResponseEntity<BookingDtos.BookingDto> cancelBooking(
            @PathVariable String bookingId,
            @AuthenticationPrincipal String currentUserId,
            Authentication authentication) {

        boolean isStaff = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_RECEPTIONIST"));

        Booking cancelled = bookingService.cancelBooking(bookingId, currentUserId, isStaff);
        return ResponseEntity.ok(bookingService.toDto(cancelled));
    }

    @PostMapping("/{bookingId}/check-in")
    @Operation(summary = "Perform guest check-in (Receptionist/Admin)")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<BookingDtos.BookingDto> checkIn(
            @PathVariable String bookingId,
            @AuthenticationPrincipal String staffId) {

        long start = System.currentTimeMillis();
        Guest staff = authService.getGuestById(staffId);
        Booking checkedIn = checkInCheckOutService.checkIn(bookingId, staff.getName());
        metricsService.recordRequest("/api/v1/bookings/" + bookingId + "/check-in", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(bookingService.toDto(checkedIn));
    }

    @PostMapping("/{bookingId}/check-out")
    @Operation(summary = "Perform guest check-out and trigger housekeeping (Receptionist/Admin)")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ResponseEntity<BookingDtos.CheckOutResponse> checkOut(
            @PathVariable String bookingId,
            @AuthenticationPrincipal String staffId) {

        long start = System.currentTimeMillis();
        Guest staff = authService.getGuestById(staffId);
        BookingDtos.CheckOutResponse response = checkInCheckOutService.checkOut(bookingId, staff.getName());
        metricsService.recordRequest("/api/v1/bookings/" + bookingId + "/check-out", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(response);
    }
}
