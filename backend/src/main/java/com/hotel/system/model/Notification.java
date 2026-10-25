package com.hotel.system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id; // Snowflake ID

    private String guestId;
    private NotificationType type;
    private String title;
    private String message;
    private String bookingId;
    private boolean read;
    private Instant createdAt;

    public Notification() {
        this.read = false;
        this.createdAt = Instant.now();
    }

    public Notification(String id, String guestId, NotificationType type, String title, String message, String bookingId) {
        this.id = id;
        this.guestId = guestId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.bookingId = bookingId;
        this.read = false;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getGuestId() { return guestId; }
    public void setGuestId(String guestId) { this.guestId = guestId; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
