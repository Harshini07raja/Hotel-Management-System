package com.hotel.system.service;

import com.hotel.system.dto.BillingDtos;
import com.hotel.system.exception.BadRequestException;
import com.hotel.system.exception.ResourceNotFoundException;
import com.hotel.system.model.Booking;
import com.hotel.system.model.Invoice;
import com.hotel.system.model.NotificationType;
import com.hotel.system.model.PaymentStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

/**
 * Billing & Simulated Payment Service.
 * 
 * Rules:
 * - Strictly decimal-safe monetary arithmetic with BigDecimal
 * - Frozen nightly price snapshot from the reservation
 * - Clearly marked simulated payments (no real card data processed)
 */
@Service
public class BillingService {
    private static final Logger log = LoggerFactory.getLogger(BillingService.class);

    private final ShardRouter shardRouter;
    private final UniqueIdGeneratorService idGenerator;
    private final NotificationService notificationService;

    public BillingService(ShardRouter shardRouter,
                          UniqueIdGeneratorService idGenerator,
                          NotificationService notificationService) {
        this.shardRouter = shardRouter;
        this.idGenerator = idGenerator;
        this.notificationService = notificationService;
    }

    public Invoice createInvoiceForBooking(Booking booking) {
        String invoiceId = idGenerator.nextInvoiceId();

        BigDecimal roomCharges = booking.getTotalPrice().setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = roomCharges.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP); // 12% tax
        BigDecimal serviceCharges = BigDecimal.valueOf(15.00).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = roomCharges.add(tax).add(serviceCharges).subtract(discount).setScale(2, RoundingMode.HALF_UP);

        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setBookingId(booking.getId());
        invoice.setHotelId(booking.getHotelId());
        invoice.setGuestId(booking.getGuestId());
        invoice.setGuestName(booking.getGuestName());
        invoice.setRoomCharges(roomCharges);
        invoice.setTaxAmount(tax);
        invoice.setServiceCharges(serviceCharges);
        invoice.setDiscount(discount);
        invoice.setTotalAmount(total);
        invoice.setPaymentStatus(PaymentStatus.UNPAID);

        MongoTemplate template = shardRouter.getTemplateForBooking(booking.getHotelId());
        template.save(invoice);
        log.info("Generated Invoice [{}] for Booking [{}] Total: ${}", invoiceId, booking.getId(), total);
        return invoice;
    }

    public Invoice getInvoiceByBookingId(String bookingId) {
        Query query = new Query(Criteria.where("bookingId").is(bookingId));
        List<Invoice> results = shardRouter.scatterGather(query, Invoice.class);
        if (results.isEmpty()) {
            throw new ResourceNotFoundException("Invoice for booking " + bookingId + " not found.");
        }
        return results.get(0);
    }

    public Invoice getInvoiceById(String invoiceId) {
        return shardRouter.findByIdAcrossShards(invoiceId, Invoice.class)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice with ID " + invoiceId + " not found."));
    }

    public BillingDtos.PaymentResponse processPayment(String bookingId, BillingDtos.PaymentRequest request, String guestId) {
        Invoice invoice = getInvoiceByBookingId(bookingId);

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            return new BillingDtos.PaymentResponse(
                    invoice.getId(), "ALREADY_PAID", invoice.getPaymentReference(),
                    invoice.getTotalAmount(), "This invoice has already been paid.");
        }

        MongoTemplate template = shardRouter.getTemplateForBooking(invoice.getHotelId());

        // Simulated payment execution
        if (request.isSimulateFailure()) {
            invoice.setPaymentStatus(PaymentStatus.FAILED);
            template.save(invoice);
            notificationService.createNotification(invoice.getGuestId(), NotificationType.PAYMENT_FAILURE,
                    "Payment Failed",
                    "Simulated payment attempt for booking " + bookingId + " was declined.", bookingId);
            return new BillingDtos.PaymentResponse(invoice.getId(), "FAILED", null, invoice.getTotalAmount(), "Payment was declined by card network.");
        }

        String transactionRef = "SIM-TX-" + idGenerator.nextRawId();
        invoice.setPaymentStatus(PaymentStatus.PAID);
        invoice.setPaymentReference(transactionRef);
        invoice.setPaymentMethod(request.getPaymentMethod());
        invoice.setPaidAt(Instant.now());
        template.save(invoice);

        notificationService.createNotification(invoice.getGuestId(), NotificationType.PAYMENT_SUCCESS,
                "Payment Successful",
                String.format("Payment of $%s for booking %s was processed successfully. Ref: %s",
                        invoice.getTotalAmount(), bookingId, transactionRef), bookingId);

        log.info("Simulated Payment SUCCESS for Invoice [{}] Ref: [{}]", invoice.getId(), transactionRef);
        return new BillingDtos.PaymentResponse(invoice.getId(), "PAID", transactionRef, invoice.getTotalAmount(), "Payment processed successfully.");
    }

    public BillingDtos.InvoiceDto toDto(Invoice inv) {
        BillingDtos.InvoiceDto dto = new BillingDtos.InvoiceDto();
        dto.setId(inv.getId());
        dto.setBookingId(inv.getBookingId());
        dto.setHotelId(inv.getHotelId());
        dto.setGuestId(inv.getGuestId());
        dto.setGuestName(inv.getGuestName());
        dto.setRoomCharges(inv.getRoomCharges());
        dto.setTaxAmount(inv.getTaxAmount());
        dto.setServiceCharges(inv.getServiceCharges());
        dto.setDiscount(inv.getDiscount());
        dto.setTotalAmount(inv.getTotalAmount());
        dto.setPaymentStatus(inv.getPaymentStatus());
        dto.setPaymentReference(inv.getPaymentReference());
        dto.setPaymentMethod(inv.getPaymentMethod());
        dto.setPaidAt(inv.getPaidAt());
        dto.setCreatedAt(inv.getCreatedAt());
        return dto;
    }
}
