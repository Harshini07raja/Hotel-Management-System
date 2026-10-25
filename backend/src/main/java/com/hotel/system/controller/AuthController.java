package com.hotel.system.controller;

import com.hotel.system.dto.AuthDtos;
import com.hotel.system.model.Guest;
import com.hotel.system.service.AuthenticationService;
import com.hotel.system.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Registration, login, and user profile authentication APIs")
public class AuthController {

    private final AuthenticationService authService;
    private final MetricsService metricsService;

    public AuthController(AuthenticationService authService, MetricsService metricsService) {
        this.authService = authService;
        this.metricsService = metricsService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new guest account")
    public ResponseEntity<AuthDtos.AuthResponse> register(@Valid @RequestBody AuthDtos.RegisterRequest request,
                                                         HttpServletRequest servletRequest) {
        long start = System.currentTimeMillis();
        String clientIp = getClientIp(servletRequest);
        AuthDtos.AuthResponse response = authService.register(request, clientIp);
        metricsService.recordRequest("/api/v1/auth/register", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and receive JWT token")
    public ResponseEntity<AuthDtos.AuthResponse> login(@Valid @RequestBody AuthDtos.LoginRequest request,
                                                      HttpServletRequest servletRequest) {
        long start = System.currentTimeMillis();
        String clientIp = getClientIp(servletRequest);
        AuthDtos.AuthResponse response = authService.login(request, clientIp);
        metricsService.recordRequest("/api/v1/auth/login", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<AuthDtos.UserProfileDto> getCurrentUser(@AuthenticationPrincipal String guestId) {
        Guest guest = authService.getGuestById(guestId);
        return ResponseEntity.ok(new AuthDtos.UserProfileDto(
                guest.getId(), guest.getName(), guest.getEmail(), guest.getPhone(), guest.getRole()
        ));
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
