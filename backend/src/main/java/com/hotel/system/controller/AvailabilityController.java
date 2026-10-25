package com.hotel.system.controller;

import com.hotel.system.dto.HotelDtos;
import com.hotel.system.service.AvailabilityService;
import com.hotel.system.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/availability")
@Tag(name = "Availability", description = "Authoritative date-based room availability checking")
public class AvailabilityController {

    private final AvailabilityService availabilityService;
    private final MetricsService metricsService;

    public AvailabilityController(AvailabilityService availabilityService, MetricsService metricsService) {
        this.availabilityService = availabilityService;
        this.metricsService = metricsService;
    }

    @GetMapping
    @Operation(summary = "Check available rooms in a hotel for given dates and guest count using half-open intervals")
    public ResponseEntity<List<HotelDtos.RoomDto>> checkAvailability(
            @RequestParam String hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam(required = false, defaultValue = "1") Integer guests) {

        long start = System.currentTimeMillis();
        List<HotelDtos.RoomDto> rooms = availabilityService.getAvailableRooms(hotelId, checkInDate, checkOutDate, guests);
        metricsService.recordRequest("/api/v1/availability", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(rooms);
    }
}
