package com.hotel.system.controller;

import com.hotel.system.dto.BillingDtos;
import com.hotel.system.model.Invoice;
import com.hotel.system.service.BillingService;
import com.hotel.system.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Billing & Payments", description = "Itemized invoice generation and simulated payment processing")
public class BillingController {

    private final BillingService billingService;
    private final MetricsService metricsService;

    public BillingController(BillingService billingService, MetricsService metricsService) {
        this.billingService = billingService;
        this.metricsService = metricsService;
    }

    @GetMapping("/bookings/{bookingId}/invoice")
    @Operation(summary = "Get itemized invoice for a booking")
    public ResponseEntity<BillingDtos.InvoiceDto> getBookingInvoice(@PathVariable String bookingId) {
        long start = System.currentTimeMillis();
        Invoice invoice = billingService.getInvoiceByBookingId(bookingId);
        metricsService.recordRequest("/api/v1/bookings/" + bookingId + "/invoice", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(billingService.toDto(invoice));
    }

    @PostMapping("/bookings/{bookingId}/payment")
    @Operation(summary = "Process simulated payment for a reservation invoice")
    public ResponseEntity<BillingDtos.PaymentResponse> processPayment(
            @PathVariable String bookingId,
            @Valid @RequestBody BillingDtos.PaymentRequest request,
            @AuthenticationPrincipal String guestId) {

        long start = System.currentTimeMillis();
        BillingDtos.PaymentResponse response = billingService.processPayment(bookingId, request, guestId);
        metricsService.recordRequest("/api/v1/bookings/" + bookingId + "/payment", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/invoices/{invoiceId}")
    @Operation(summary = "Get invoice by invoice ID")
    public ResponseEntity<BillingDtos.InvoiceDto> getInvoiceById(@PathVariable String invoiceId) {
        Invoice invoice = billingService.getInvoiceById(invoiceId);
        return ResponseEntity.ok(billingService.toDto(invoice));
    }
}
