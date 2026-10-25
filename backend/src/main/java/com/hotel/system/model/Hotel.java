package com.hotel.system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "hotels")
@CompoundIndexes({
    @CompoundIndex(name = "city_rating_idx", def = "{'city': 1, 'starRating': -1}")
})
public class Hotel {
    @Id
    private String id; // e.g. "HTL-101"

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
    private Instant createdAt;

    public Hotel() {
        this.createdAt = Instant.now();
    }

    public Hotel(String id, String name, String city, String address, String country,
                 String description, double starRating, List<String> amenities,
                 List<String> images, BigDecimal basePrice, long popularityScore) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.address = address;
        this.country = country;
        this.description = description;
        this.starRating = starRating;
        this.amenities = amenities != null ? amenities : new ArrayList<>();
        this.images = images != null ? images : new ArrayList<>();
        this.basePrice = basePrice;
        this.popularityScore = popularityScore;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
