package com.hotel.system.controller;

import com.hotel.system.model.ShortUrl;
import com.hotel.system.service.MetricsService;
import com.hotel.system.service.UrlShortenerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@Tag(name = "URL Shortener", description = "Shareable short booking URLs and redirection")
public class UrlShortenerController {

    private final UrlShortenerService urlShortenerService;
    private final MetricsService metricsService;

    public UrlShortenerController(UrlShortenerService urlShortenerService, MetricsService metricsService) {
        this.urlShortenerService = urlShortenerService;
        this.metricsService = metricsService;
    }

    @PostMapping("/api/v1/short-urls")
    @Operation(summary = "Generate a short URL for a booking")
    public ResponseEntity<ShortUrl> createShortUrl(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal String guestId) {

        String bookingId = body.get("bookingId");
        String targetUrl = body.getOrDefault("targetUrl", "/bookings/" + bookingId);
        ShortUrl shortUrl = urlShortenerService.createShortUrl(bookingId, targetUrl, guestId);
        return ResponseEntity.ok(shortUrl);
    }

    @GetMapping("/api/v1/short-urls/{code}")
    @Operation(summary = "Resolve short URL code metadata")
    public ResponseEntity<ShortUrl> getShortUrlMetadata(@PathVariable String code) {
        long start = System.currentTimeMillis();
        return urlShortenerService.resolveShortCode(code)
                .map(s -> {
                    metricsService.recordRequest("/api/v1/short-urls/" + code, System.currentTimeMillis() - start, true);
                    return ResponseEntity.ok(s);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/s/{code}")
    @Operation(summary = "Redirect to target booking page via short URL code")
    public ResponseEntity<Void> redirectShortUrl(@PathVariable String code) {
        long start = System.currentTimeMillis();
        return urlShortenerService.resolveShortCode(code)
                .map(s -> {
                    metricsService.recordRequest("/s/" + code, System.currentTimeMillis() - start, true);
                    HttpHeaders headers = new HttpHeaders();
                    headers.setLocation(URI.create(s.getTargetUrl()));
                    return new ResponseEntity<Void>(headers, HttpStatus.FOUND);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
