package com.hotel.system.dto;

import com.hotel.system.model.HousekeepingStatus;
import com.hotel.system.model.RoomStatus;
import com.hotel.system.model.RoomType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class HotelDtos {

    public static class HotelDto {
        private String id;
        private String name;
        private String city;
        private String address;
        private String country;
        private String description;
        private double starRating;
        private List<String> amenities = new ArrayList<>();
        private List<String> images = new ArrayList<>();
        private BigDecimal basePrice;
        private long popularityScore;
        private List<RoomDto> rooms = new ArrayList<>();

        public HotelDto() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public double getStarRating() { return starRating; }
        public void setStarRating(double starRating) { this.starRating = starRating; }
        public List<String> getAmenities() { return amenities; }
        public void setAmenities(List<String> amenities) { this.amenities = amenities; }
        public List<String> getImages() { return images; }
        public void setImages(List<String> images) { this.images = images; }
        public BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
        public long getPopularityScore() { return popularityScore; }
        public void setPopularityScore(long popularityScore) { this.popularityScore = popularityScore; }
        public List<RoomDto> getRooms() { return rooms; }
        public void setRooms(List<RoomDto> rooms) { this.rooms = rooms; }
    }

    public static class RoomDto {
        private String id;
        private String hotelId;
        private String roomNumber;
        private RoomType roomType;
        private int capacity;
        private BigDecimal nightlyPrice;
        private List<String> amenities = new ArrayList<>();
        private RoomStatus status;
        private HousekeepingStatus housekeepingStatus;
        private boolean isAvailable;

        public RoomDto() {
            this.isAvailable = true;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getHotelId() { return hotelId; }
        public void setHotelId(String hotelId) { this.hotelId = hotelId; }
        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
        public RoomType getRoomType() { return roomType; }
        public void setRoomType(RoomType roomType) { this.roomType = roomType; }
        public int getCapacity() { return capacity; }
        public void setCapacity(int capacity) { this.capacity = capacity; }
        public BigDecimal getNightlyPrice() { return nightlyPrice; }
        public void setNightlyPrice(BigDecimal nightlyPrice) { this.nightlyPrice = nightlyPrice; }
        public List<String> getAmenities() { return amenities; }
        public void setAmenities(List<String> amenities) { this.amenities = amenities; }
        public RoomStatus getStatus() { return status; }
        public void setStatus(RoomStatus status) { this.status = status; }
        public HousekeepingStatus getHousekeepingStatus() { return housekeepingStatus; }
        public void setHousekeepingStatus(HousekeepingStatus housekeepingStatus) { this.housekeepingStatus = housekeepingStatus; }
        public boolean isAvailable() { return isAvailable; }
        public void setAvailable(boolean available) { isAvailable = available; }
    }

    public static class HotelSearchRequest {
        private String city;
        private String query;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer guests;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private List<String> amenities;
        private String roomType;
        private String sortBy; // "price_asc", "price_desc", "rating", "popularity"
        private int page = 0;
        private int size = 10;

        public HotelSearchRequest() {}

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
        public LocalDate getCheckInDate() { return checkInDate; }
        public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }
        public LocalDate getCheckOutDate() { return checkOutDate; }
        public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }
        public Integer getGuests() { return guests; }
        public void setGuests(Integer guests) { this.guests = guests; }
        public BigDecimal getMinPrice() { return minPrice; }
        public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
        public BigDecimal getMaxPrice() { return maxPrice; }
        public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
        public List<String> getAmenities() { return amenities; }
        public void setAmenities(List<String> amenities) { this.amenities = amenities; }
        public String getRoomType() { return roomType; }
        public void setRoomType(String roomType) { this.roomType = roomType; }
        public String getSortBy() { return sortBy; }
        public void setSortBy(String sortBy) { this.sortBy = sortBy; }
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
    }

    public static class HotelSearchResponse {
        private List<HotelDto> hotels = new ArrayList<>();
        private long totalElements;
        private int page;
        private int totalPages;

        public HotelSearchResponse() {}
        public HotelSearchResponse(List<HotelDto> hotels, long totalElements, int page, int totalPages) {
            this.hotels = hotels;
            this.totalElements = totalElements;
            this.page = page;
            this.totalPages = totalPages;
        }

        public List<HotelDto> getHotels() { return hotels; }
        public void setHotels(List<HotelDto> hotels) { this.hotels = hotels; }
        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    }
}
