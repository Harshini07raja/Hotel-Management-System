package com.hotel.system.controller;

import com.hotel.system.dto.AuthDtos;
import com.hotel.system.dto.BookingDtos;
import com.hotel.system.model.Booking;
import com.hotel.system.model.Guest;
import com.hotel.system.service.BookingService;
import com.hotel.system.service.GuestService;
import com.hotel.system.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/guests")
@Tag(name = "Guests", description = "Guest profile management and personal booking history")
public class GuestController {

    private final GuestService guestService;
    private final BookingService bookingService;
    private final MetricsService metricsService;

    public GuestController(GuestService guestService, BookingService bookingService, MetricsService metricsService) {
        this.guestService = guestService;
        this.bookingService = bookingService;
        this.metricsService = metricsService;
    }

    @GetMapping("/me")
    @Operation(summary = "View personal guest profile")
    public ResponseEntity<AuthDtos.UserProfileDto> getProfile(@AuthenticationPrincipal String guestId) {
        Guest guest = guestService.getGuestById(guestId);
        return ResponseEntity.ok(new AuthDtos.UserProfileDto(
                guest.getId(), guest.getName(), guest.getEmail(), guest.getPhone(), guest.getRole()
        ));
    }

    @PutMapping("/me")
    @Operation(summary = "Update personal profile details")
    public ResponseEntity<AuthDtos.UserProfileDto> updateProfile(@AuthenticationPrincipal String guestId,
                                                                 @RequestBody AuthDtos.UserProfileDto request) {
        Guest updated = guestService.updateProfile(guestId, request);
        return ResponseEntity.ok(new AuthDtos.UserProfileDto(
                updated.getId(), updated.getName(), updated.getEmail(), updated.getPhone(), updated.getRole()
        ));
    }

    @GetMapping("/me/bookings")
    @Operation(summary = "List reservations for current authenticated guest")
    public ResponseEntity<List<BookingDtos.BookingDto>> getMyBookings(@AuthenticationPrincipal String guestId) {
        long start = System.currentTimeMillis();
        List<Booking> bookings = guestService.getGuestBookings(guestId);
        List<BookingDtos.BookingDto> dtos = bookings.stream().map(bookingService::toDto).collect(Collectors.toList());
        metricsService.recordRequest("/api/v1/guests/me/bookings", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(dtos);
    }
}
