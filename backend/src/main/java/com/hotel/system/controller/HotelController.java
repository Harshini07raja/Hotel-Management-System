package com.hotel.system.controller;

import com.hotel.system.dto.HotelDtos;
import com.hotel.system.model.Hotel;
import com.hotel.system.model.Room;
import com.hotel.system.service.AvailabilityService;
import com.hotel.system.service.HotelService;
import com.hotel.system.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/hotels")
@Tag(name = "Hotels", description = "Hotel discovery, details, and room catalog APIs")
public class HotelController {

    private final HotelService hotelService;
    private final AvailabilityService availabilityService;
    private final MetricsService metricsService;

    public HotelController(HotelService hotelService, AvailabilityService availabilityService, MetricsService metricsService) {
        this.hotelService = hotelService;
        this.availabilityService = availabilityService;
        this.metricsService = metricsService;
    }

    @GetMapping
    @Operation(summary = "List all available hotels across shards")
    public ResponseEntity<List<HotelDtos.HotelDto>> getAllHotels() {
        long start = System.currentTimeMillis();
        List<Hotel> hotels = hotelService.getAllHotels();
        List<HotelDtos.HotelDto> dtos = hotels.stream().map(hotelService::toDto).collect(Collectors.toList());
        metricsService.recordRequest("/api/v1/hotels", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{hotelId}")
    @Operation(summary = "Get detailed information for a specific hotel (cached via Redis)")
    public ResponseEntity<HotelDtos.HotelDto> getHotelById(@PathVariable String hotelId) {
        long start = System.currentTimeMillis();
        Hotel hotel = hotelService.getHotelById(hotelId);
        HotelDtos.HotelDto dto = hotelService.toDto(hotel);

        // Fetch rooms for this hotel
        List<Room> rooms = hotelService.getRoomsForHotel(hotelId);
        dto.setRooms(rooms.stream().map(availabilityService::toDto).collect(Collectors.toList()));

        metricsService.recordRequest("/api/v1/hotels/" + hotelId, System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{hotelId}/rooms")
    @Operation(summary = "List all rooms belonging to a hotel")
    public ResponseEntity<List<HotelDtos.RoomDto>> getHotelRooms(@PathVariable String hotelId) {
        List<Room> rooms = hotelService.getRoomsForHotel(hotelId);
        List<HotelDtos.RoomDto> dtos = rooms.stream().map(availabilityService::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
