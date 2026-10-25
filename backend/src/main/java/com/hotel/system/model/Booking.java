package com.hotel.system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "bookings")
@CompoundIndexes({
    @CompoundIndex(name = "room_dates_status_idx", def = "{'roomId': 1, 'checkInDate': 1, 'checkOutDate': 1, 'status': 1}"),
    @CompoundIndex(name = "guest_created_idx", def = "{'guestId': 1, 'createdAt': -1}")
})
public class Booking {
    @Id
    private String id; // Snowflake ID, e.g. "BK-1823901"

    @Indexed(sparse = true)
    private String idempotencyKey;

    private String hotelId;
    private String hotelName;
    private String roomId;
    private String roomNumber;
    private RoomType roomType;
    private String guestId;
    private String guestName;
    private String guestEmail;

    private LocalDate checkInDate;  // Inclusive start date
    private LocalDate checkOutDate; // Exclusive end date (half-open [checkIn, checkOut))
    private int guestCount;

    private BigDecimal nightlyRateSnapshot; // Frozen rate snapshot
    private int totalNights;
    private BigDecimal totalPrice;

    private BookingStatus status;
    private String shortBookingCode;
    private String shortBookingUrl;

    private Instant createdAt;
    private Instant updatedAt;

    public Booking() {
        this.status = BookingStatus.CONFIRMED;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getHotelId() { return hotelId; }
    public void setHotelId(String hotelId) { this.hotelId = hotelId; }

    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public RoomType getRoomType() { return roomType; }
    public void setRoomType(RoomType roomType) { this.roomType = roomType; }

    public String getGuestId() { return guestId; }
    public void setGuestId(String guestId) { this.guestId = guestId; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public LocalDate getCheckInDate() { return checkInDate; }
    public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }

    public LocalDate getCheckOutDate() { return checkOutDate; }
    public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }

    public int getGuestCount() { return guestCount; }
    public void setGuestCount(int guestCount) { this.guestCount = guestCount; }

    public BigDecimal getNightlyRateSnapshot() { return nightlyRateSnapshot; }
    public void setNightlyRateSnapshot(BigDecimal nightlyRateSnapshot) { this.nightlyRateSnapshot = nightlyRateSnapshot; }

    public int getTotalNights() { return totalNights; }
    public void setTotalNights(int totalNights) { this.totalNights = totalNights; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public String getShortBookingCode() { return shortBookingCode; }
    public void setShortBookingCode(String shortBookingCode) { this.shortBookingCode = shortBookingCode; }

    public String getShortBookingUrl() { return shortBookingUrl; }
    public void setShortBookingUrl(String shortBookingUrl) { this.shortBookingUrl = shortBookingUrl; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
