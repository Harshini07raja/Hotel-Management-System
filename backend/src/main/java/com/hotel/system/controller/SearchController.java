package com.hotel.system.controller;

import com.hotel.system.dto.HotelDtos;
import com.hotel.system.service.AutocompleteService;
import com.hotel.system.service.HotelService;
import com.hotel.system.service.MetricsService;
import com.hotel.system.util.Trie;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@Tag(name = "Search & Autocomplete", description = "Multi-shard hotel search and fast Trie-based prefix autocomplete")
public class SearchController {

    private final HotelService hotelService;
    private final AutocompleteService autocompleteService;
    private final MetricsService metricsService;

    public SearchController(HotelService hotelService, AutocompleteService autocompleteService, MetricsService metricsService) {
        this.hotelService = hotelService;
        this.autocompleteService = autocompleteService;
        this.metricsService = metricsService;
    }

    @GetMapping("/hotels")
    @Operation(summary = "Search hotels across shards with filtering, pagination, and sorting")
    public ResponseEntity<HotelDtos.HotelSearchResponse> searchHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false, defaultValue = "popularity") String sortBy,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {

        long start = System.currentTimeMillis();

        HotelDtos.HotelSearchRequest req = new HotelDtos.HotelSearchRequest();
        req.setCity(city);
        req.setQuery(query);
        req.setCheckInDate(checkInDate);
        req.setCheckOutDate(checkOutDate);
        req.setGuests(guests);
        req.setMinPrice(minPrice);
        req.setMaxPrice(maxPrice);
        req.setAmenities(amenities);
        req.setRoomType(roomType);
        req.setSortBy(sortBy);
        req.setPage(page);
        req.setSize(size);

        HotelDtos.HotelSearchResponse response = hotelService.searchHotels(req);
        metricsService.recordRequest("/api/v1/search/hotels", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/autocomplete")
    @Operation(summary = "Get instantaneous prefix suggestions for hotels, cities, and amenities")
    public ResponseEntity<List<Trie.Suggestion>> getAutocomplete(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false, defaultValue = "6") int limit) {

        long start = System.currentTimeMillis();
        List<Trie.Suggestion> suggestions = autocompleteService.getSuggestions(q, limit);
        metricsService.recordRequest("/api/v1/search/autocomplete", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(suggestions);
    }
}
