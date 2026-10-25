package com.hotel.system.service;

import com.hotel.system.dto.HotelDtos;
import com.hotel.system.exception.ResourceNotFoundException;
import com.hotel.system.model.Hotel;
import com.hotel.system.model.Room;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class HotelService {

    private final ShardRouter shardRouter;
    private final CacheService cacheService;

    public HotelService(ShardRouter shardRouter, CacheService cacheService) {
        this.shardRouter = shardRouter;
        this.cacheService = cacheService;
    }

    public List<Hotel> getAllHotels() {
        return shardRouter.scatterGather(new Query(), Hotel.class);
    }

    public Hotel getHotelById(String hotelId) {
        // 1. Check Redis cache
        String cacheKey = "hotel:" + hotelId;
        Hotel cached = cacheService.get(cacheKey, Hotel.class);
        if (cached != null) {
            return cached;
        }

        // 2. Query Authoritative Mongo Shard
        MongoTemplate template = shardRouter.getTemplateForHotel(hotelId);
        Hotel hotel = template.findById(hotelId, Hotel.class);
        if (hotel == null) {
            // Scatter-gather fallback in case hotelId routing shifted
            hotel = shardRouter.findByIdAcrossShards(hotelId, Hotel.class)
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel with ID " + hotelId + " not found."));
        }

        // 3. Cache hotel details for 1 hour
        cacheService.put(cacheKey, hotel, 3600);
        return hotel;
    }

    public List<Room> getRoomsForHotel(String hotelId) {
        MongoTemplate template = shardRouter.getTemplateForHotel(hotelId);
        Query query = new Query(Criteria.where("hotelId").is(hotelId));
        return template.find(query, Room.class);
    }

    public HotelDtos.HotelSearchResponse searchHotels(HotelDtos.HotelSearchRequest request) {
        List<Hotel> allHotels = shardRouter.scatterGather(new Query(), Hotel.class);

        // In-memory multi-shard filtering and ranking
        List<Hotel> filtered = allHotels.stream()
                .filter(h -> {
                    if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
                        if (!h.getCity().equalsIgnoreCase(request.getCity().trim())) return false;
                    }
                    if (request.getQuery() != null && !request.getQuery().trim().isEmpty()) {
                        String q = request.getQuery().trim().toLowerCase();
                        boolean matchName = h.getName().toLowerCase().contains(q);
                        boolean matchCity = h.getCity().toLowerCase().contains(q);
                        boolean matchDesc = h.getDescription() != null && h.getDescription().toLowerCase().contains(q);
                        if (!matchName && !matchCity && !matchDesc) return false;
                    }
                    if (request.getMinPrice() != null) {
                        if (h.getBasePrice().compareTo(request.getMinPrice()) < 0) return false;
                    }
                    if (request.getMaxPrice() != null) {
                        if (h.getBasePrice().compareTo(request.getMaxPrice()) > 0) return false;
                    }
                    if (request.getAmenities() != null && !request.getAmenities().isEmpty()) {
                        if (h.getAmenities() == null || !h.getAmenities().containsAll(request.getAmenities())) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    String sort = request.getSortBy() != null ? request.getSortBy() : "popularity";
                    switch (sort) {
                        case "price_asc":
                            return a.getBasePrice().compareTo(b.getBasePrice());
                        case "price_desc":
                            return b.getBasePrice().compareTo(a.getBasePrice());
                        case "rating":
                            return Double.compare(b.getStarRating(), a.getStarRating());
                        case "popularity":
                        default:
                            return Long.compare(b.getPopularityScore(), a.getPopularityScore());
                    }
                })
                .collect(Collectors.toList());

        long totalElements = filtered.size();
        int page = Math.max(0, request.getPage());
        int size = Math.max(1, request.getSize());
        int fromIndex = Math.min(page * size, filtered.size());
        int toIndex = Math.min(fromIndex + size, filtered.size());

        List<Hotel> paged = filtered.subList(fromIndex, toIndex);
        List<HotelDtos.HotelDto> dtos = paged.stream().map(this::toDto).collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) totalElements / size);
        return new HotelDtos.HotelSearchResponse(dtos, totalElements, page, totalPages);
    }

    public HotelDtos.HotelDto toDto(Hotel hotel) {
        HotelDtos.HotelDto dto = new HotelDtos.HotelDto();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setCity(hotel.getCity());
        dto.setAddress(hotel.getAddress());
        dto.setCountry(hotel.getCountry());
        dto.setDescription(hotel.getDescription());
        dto.setStarRating(hotel.getStarRating());
        dto.setAmenities(hotel.getAmenities());
        dto.setImages(hotel.getImages());
        dto.setBasePrice(hotel.getBasePrice());
        dto.setPopularityScore(hotel.getPopularityScore());
        return dto;
    }
}
