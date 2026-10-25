package com.hotel.system.dto;

import com.hotel.system.model.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public class BillingDtos {

    public static class InvoiceDto {
        private String id;
        private String bookingId;
        private String hotelId;
        private String guestId;
        private String guestName;
        private BigDecimal roomCharges;
        private BigDecimal taxAmount;
        private BigDecimal serviceCharges;
        private BigDecimal discount;
        private BigDecimal totalAmount;
        private PaymentStatus paymentStatus;
        private String paymentReference;
        private String paymentMethod;
        private Instant paidAt;
        private Instant createdAt;

        public InvoiceDto() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getBookingId() { return bookingId; }
        public void setBookingId(String bookingId) { this.bookingId = bookingId; }
        public String getHotelId() { return hotelId; }
        public void setHotelId(String hotelId) { this.hotelId = hotelId; }
        public String getGuestId() { return guestId; }
        public void setGuestId(String guestId) { this.guestId = guestId; }
        public String getGuestName() { return guestName; }
        public void setGuestName(String guestName) { this.guestName = guestName; }
        public BigDecimal getRoomCharges() { return roomCharges; }
        public void setRoomCharges(BigDecimal roomCharges) { this.roomCharges = roomCharges; }
        public BigDecimal getTaxAmount() { return taxAmount; }
        public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
        public BigDecimal getServiceCharges() { return serviceCharges; }
        public void setServiceCharges(BigDecimal serviceCharges) { this.serviceCharges = serviceCharges; }
        public BigDecimal getDiscount() { return discount; }
        public void setDiscount(BigDecimal discount) { this.discount = discount; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public PaymentStatus getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
        public String getPaymentReference() { return paymentReference; }
        public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public Instant getPaidAt() { return paidAt; }
        public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class PaymentRequest {
        @NotBlank(message = "Payment method is required")
        private String paymentMethod; // e.g. "SIMULATED_CARD", "SIMULATED_UPI"

        private String simulatedCardNumber;
        private boolean simulateFailure = false;

        public PaymentRequest() {}

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getSimulatedCardNumber() { return simulatedCardNumber; }
        public void setSimulatedCardNumber(String simulatedCardNumber) { this.simulatedCardNumber = simulatedCardNumber; }
        public boolean isSimulateFailure() { return simulateFailure; }
        public void setSimulateFailure(boolean simulateFailure) { this.simulateFailure = simulateFailure; }
    }

    public static class PaymentResponse {
        private String invoiceId;
        private String paymentStatus;
        private String paymentReference;
        private BigDecimal amountPaid;
        private String message;

        public PaymentResponse() {}
        public PaymentResponse(String invoiceId, String paymentStatus, String paymentReference, BigDecimal amountPaid, String message) {
            this.invoiceId = invoiceId;
            this.paymentStatus = paymentStatus;
            this.paymentReference = paymentReference;
            this.amountPaid = amountPaid;
            this.message = message;
        }

        public String getInvoiceId() { return invoiceId; }
        public void setInvoiceId(String invoiceId) { this.invoiceId = invoiceId; }
        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
        public String getPaymentReference() { return paymentReference; }
        public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
        public BigDecimal getAmountPaid() { return amountPaid; }
        public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
