package com.hotel.system.controller;

import com.hotel.system.model.Notification;
import com.hotel.system.service.MetricsService;
import com.hotel.system.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Guest notification inbox and status updates")
public class NotificationController {

    private final NotificationService notificationService;
    private final MetricsService metricsService;

    public NotificationController(NotificationService notificationService, MetricsService metricsService) {
        this.notificationService = notificationService;
        this.metricsService = metricsService;
    }

    @GetMapping
    @Operation(summary = "List all persistent notifications for current authenticated guest")
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal String guestId) {
        long start = System.currentTimeMillis();
        List<Notification> list = notificationService.getGuestNotifications(guestId);
        metricsService.recordRequest("/api/v1/notifications", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String notificationId,
            @AuthenticationPrincipal String guestId) {

        boolean success = notificationService.markAsRead(notificationId, guestId);
        return success ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
