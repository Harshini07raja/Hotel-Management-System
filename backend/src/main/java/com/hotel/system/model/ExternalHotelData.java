package com.hotel.system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "external_hotel_data")
public class ExternalHotelData {
    @Id
    private String id;

    private String sourceUrl;
    private String hotelName;
    private String location;
    private BigDecimal publishedPrice;
    private List<String> roomCategories = new ArrayList<>();
    private List<String> amenities = new ArrayList<>();
    private double rating;
    private int reviewsCount;
    private Instant crawledAt;
    private String status; // "SUCCESS", "PARTIAL", "FAILED"

    public ExternalHotelData() {
        this.crawledAt = Instant.now();
        this.status = "SUCCESS";
    }

    public ExternalHotelData(String id, String sourceUrl, String hotelName, String location,
                             BigDecimal publishedPrice, List<String> roomCategories,
                             List<String> amenities, double rating, int reviewsCount) {
        this.id = id;
        this.sourceUrl = sourceUrl;
        this.hotelName = hotelName;
        this.location = location;
        this.publishedPrice = publishedPrice;
        this.roomCategories = roomCategories != null ? roomCategories : new ArrayList<>();
        this.amenities = amenities != null ? amenities : new ArrayList<>();
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.crawledAt = Instant.now();
        this.status = "SUCCESS";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public BigDecimal getPublishedPrice() { return publishedPrice; }
    public void setPublishedPrice(BigDecimal publishedPrice) { this.publishedPrice = publishedPrice; }

    public List<String> getRoomCategories() { return roomCategories; }
    public void setRoomCategories(List<String> roomCategories) { this.roomCategories = roomCategories; }

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(int reviewsCount) { this.reviewsCount = reviewsCount; }

    public Instant getCrawledAt() { return crawledAt; }
    public void setCrawledAt(Instant crawledAt) { this.crawledAt = crawledAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
