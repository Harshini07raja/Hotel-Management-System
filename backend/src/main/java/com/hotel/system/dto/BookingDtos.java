package com.hotel.system.dto;

import com.hotel.system.model.BookingStatus;
import com.hotel.system.model.RoomType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class BookingDtos {

    public static class CreateBookingRequest {
        @NotBlank(message = "Hotel ID is required")
        private String hotelId;

        @NotBlank(message = "Room ID is required")
        private String roomId;

        @NotNull(message = "Check-in date is required")
        private LocalDate checkInDate;

        @NotNull(message = "Check-out date is required")
        private LocalDate checkOutDate;

        @Min(value = 1, message = "Guest count must be at least 1")
        private int guestCount = 1;

        // Idempotency key supplied by client to prevent duplicate bookings on retries
        private String idempotencyKey;

        public CreateBookingRequest() {}

        public String getHotelId() { return hotelId; }
        public void setHotelId(String hotelId) { this.hotelId = hotelId; }
        public String getRoomId() { return roomId; }
        public void setRoomId(String roomId) { this.roomId = roomId; }
        public LocalDate getCheckInDate() { return checkInDate; }
        public void setCheckInDate(LocalDate checkInDate) { this.checkInDate = checkInDate; }
        public LocalDate getCheckOutDate() { return checkOutDate; }
        public void setCheckOutDate(LocalDate checkOutDate) { this.checkOutDate = checkOutDate; }
        public int getGuestCount() { return guestCount; }
        public void setGuestCount(int guestCount) { this.guestCount = guestCount; }
        public String getIdempotencyKey() { return idempotencyKey; }
        public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    }

    public static class BookingDto {
        private String id;
        private String idempotencyKey;
        private String hotelId;
        private String hotelName;
        private String roomId;
        private String roomNumber;
        private RoomType roomType;
        private String guestId;
        private String guestName;
        private String guestEmail;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private int guestCount;
        private BigDecimal nightlyRateSnapshot;
        private int totalNights;
        private BigDecimal totalPrice;
        private BookingStatus status;
        private String shortBookingCode;
        private String shortBookingUrl;
        private Instant createdAt;

        public BookingDto() {}

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
    }

    public static class CheckInRequest {
        private String notes;
        public CheckInRequest() {}
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class CheckOutResponse {
        private String bookingId;
        private String invoiceId;
        private BigDecimal totalAmount;
        private String paymentStatus;
        private String message;

        public CheckOutResponse() {}
        public CheckOutResponse(String bookingId, String invoiceId, BigDecimal totalAmount, String paymentStatus, String message) {
            this.bookingId = bookingId;
            this.invoiceId = invoiceId;
            this.totalAmount = totalAmount;
            this.paymentStatus = paymentStatus;
            this.message = message;
        }

        public String getBookingId() { return bookingId; }
        public void setBookingId(String bookingId) { this.bookingId = bookingId; }
        public String getInvoiceId() { return invoiceId; }
        public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
