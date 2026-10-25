package com.hotel.system.controller;

import com.hotel.system.model.ExternalHotelData;
import com.hotel.system.service.HotelCrawlerService;
import com.hotel.system.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Web Crawler", description = "Simulated web crawler for competitor hotel intelligence")
public class CrawlerController {

    private final HotelCrawlerService crawlerService;
    private final MetricsService metricsService;

    @Value("${server.port:8080}")
    private int serverPort;

    public CrawlerController(HotelCrawlerService crawlerService, MetricsService metricsService) {
        this.crawlerService = crawlerService;
        this.metricsService = metricsService;
    }

    @PostMapping("/crawler/run")
    @Operation(summary = "Trigger web crawler against mock hotel sites")
    public ResponseEntity<Map<String, Object>> runCrawler(@RequestBody(required = false) Map<String, List<String>> body) {
        long start = System.currentTimeMillis();

        List<String> targetUrls;
        if (body != null && body.containsKey("urls") && !body.get("urls").isEmpty()) {
            targetUrls = body.get("urls");
        } else {
            String baseUrl = "http://localhost:" + serverPort + "/mock-hotels";
            targetUrls = Arrays.asList(
                    baseUrl + "/grand-azure",
                    baseUrl + "/emerald-bay",
                    baseUrl + "/solaris-resort"
            );
        }

        Map<String, Object> result = crawlerService.runCrawl(targetUrls);
        metricsService.recordRequest("/api/v1/crawler/run", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/crawler/status")
    @Operation(summary = "Get current web crawler status and execution telemetry")
    public ResponseEntity<Map<String, Object>> getCrawlerStatus() {
        return ResponseEntity.ok(crawlerService.getStatus());
    }

    @GetMapping("/external-hotels")
    @Operation(summary = "List normalized external hotel records scraped by crawler")
    public ResponseEntity<List<ExternalHotelData>> getExternalHotels() {
        return ResponseEntity.ok(crawlerService.getCrawledHotels());
    }
}
