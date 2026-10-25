package com.hotel.system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "short_urls")
public class ShortUrl {
    @Id
    private String id;

    @Indexed(unique = true)
    private String shortCode; // e.g. "xK9mP2q"

    private String bookingId;
    private String targetUrl;
    private String guestId;
    private long clickCount;
    private Instant createdAt;
    private Instant expiresAt;

    public ShortUrl() {
        this.clickCount = 0;
        this.createdAt = Instant.now();
    }

    public ShortUrl(String shortCode, String bookingId, String targetUrl, String guestId) {
        this.shortCode = shortCode;
        this.bookingId = bookingId;
        this.targetUrl = targetUrl;
        this.guestId = guestId;
        this.clickCount = 0;
        this.createdAt = Instant.now();
        this.expiresAt = Instant.now().plusSeconds(86400 * 30); // 30 days
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getShortCode() { return shortCode; }
    public void setShortCode(String shortCode) { this.shortCode = shortCode; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getTargetUrl() { return targetUrl; }
    public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }

    public String getGuestId() { return guestId; }
    public void setGuestId(String guestId) { this.guestId = guestId; }

    public long getClickCount() { return clickCount; }
    public void setClickCount(long clickCount) { this.clickCount = clickCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
