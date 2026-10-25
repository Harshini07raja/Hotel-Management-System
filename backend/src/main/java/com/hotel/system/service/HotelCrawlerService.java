package com.hotel.system.service;

import com.hotel.system.model.ExternalHotelData;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Web Crawler for Simulated External Hotel Websites.
 * Features:
 * - Scrapes 3 mock hotel websites locally
 * - Jsoup HTML DOM parsing for rates, amenities, room types, reviews
 * - Enforces polite crawl delay and visited URL deduplication
 * - Stores normalized data in external_hotel_data
 * - Does not overwrite authoritative internal room inventory
 */
@Service
public class HotelCrawlerService {
    private static final Logger log = LoggerFactory.getLogger(HotelCrawlerService.class);

    @Value("${hotel.crawler.crawl-delay-ms:200}")
    private long crawlDelayMs;

    private final ShardRouter shardRouter;
    private final UniqueIdGeneratorService idGenerator;

    private final Set<String> visitedUrls = ConcurrentHashMap.newKeySet();
    private final AtomicBoolean isRunning = new AtomicBoolean(false);

    private int totalCrawled = 0;
    private int successCount = 0;
    private int failureCount = 0;
    private long lastCrawlDurationMs = 0;

    public HotelCrawlerService(ShardRouter shardRouter, UniqueIdGeneratorService idGenerator) {
        this.shardRouter = shardRouter;
        this.idGenerator = idGenerator;
    }

    public synchronized Map<String, Object> runCrawl(List<String> targetUrls) {
        if (isRunning.get()) {
            return Map.of("status", "ALREADY_RUNNING", "message", "A crawl task is currently active.");
        }

        isRunning.set(true);
        long startTime = System.currentTimeMillis();
        totalCrawled = 0;
        successCount = 0;
        failureCount = 0;

        MongoTemplate template = shardRouter.getShardTemplate("shard-0");

        try {
            for (String url : targetUrls) {
                if (visitedUrls.contains(url)) {
                    log.info("Skipping already visited URL: {}", url);
                    continue;
                }

                try {
                    // Polite crawl delay
                    if (crawlDelayMs > 0) {
                        Thread.sleep(crawlDelayMs);
                    }

                    // Fetch & parse HTML
                    Document doc = Jsoup.connect(url)
                            .timeout(5000)
                            .userAgent("AntigravityHotelCrawler/1.0")
                            .get();

                    ExternalHotelData data = parseHotelDocument(url, doc);
                    data.setId("EXT-" + idGenerator.nextRawId());
                    template.save(data);

                    visitedUrls.add(url);
                    successCount++;
                } catch (Exception e) {
                    log.warn("Failed to crawl {}: {}", url, e.getMessage());
                    failureCount++;
                }
                totalCrawled++;
            }
        } finally {
            lastCrawlDurationMs = System.currentTimeMillis() - startTime;
            isRunning.set(false);
        }

        double pagesPerSec = lastCrawlDurationMs > 0 ? (totalCrawled * 1000.0 / lastCrawlDurationMs) : 0.0;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("status", "COMPLETED");
        summary.put("totalCrawled", totalCrawled);
        summary.put("successCount", successCount);
        summary.put("failureCount", failureCount);
        summary.put("durationMs", lastCrawlDurationMs);
        summary.put("pagesPerSecond", Math.round(pagesPerSec * 100.0) / 100.0);
        return summary;
    }

    private ExternalHotelData parseHotelDocument(String url, Document doc) {
        String name = doc.select(".hotel-name").text();
        if (name.isEmpty()) name = doc.title();

        String location = doc.select(".hotel-location").text();
        String priceText = doc.select(".published-price").text().replaceAll("[^0-9.]", "");
        BigDecimal price = !priceText.isEmpty() ? new BigDecimal(priceText) : BigDecimal.valueOf(150.0);

        List<String> amenities = new ArrayList<>();
        Elements amenityElements = doc.select(".amenity-tag");
        for (Element el : amenityElements) {
            amenities.add(el.text().trim());
        }

        List<String> rooms = new ArrayList<>();
        Elements roomElements = doc.select(".room-category");
        for (Element el : roomElements) {
            rooms.add(el.text().trim());
        }

        String ratingText = doc.select(".hotel-rating").text().replaceAll("[^0-9.]", "");
        double rating = !ratingText.isEmpty() ? Double.parseDouble(ratingText) : 4.5;

        String reviewCountText = doc.select(".review-count").text().replaceAll("[^0-9]", "");
        int reviews = !reviewCountText.isEmpty() ? Integer.parseInt(reviewCountText) : 120;

        return new ExternalHotelData(null, url, name, location, price, rooms, amenities, rating, reviews);
    }

    public List<ExternalHotelData> getCrawledHotels() {
        MongoTemplate template = shardRouter.getShardTemplate("shard-0");
        return template.find(new Query(), ExternalHotelData.class);
    }

    public Map<String, Object> getStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("isRunning", isRunning.get());
        status.put("totalVisitedUrls", visitedUrls.size());
        status.put("lastCrawledCount", totalCrawled);
        status.put("successCount", successCount);
        status.put("failureCount", failureCount);
        status.put("lastDurationMs", lastCrawlDurationMs);
        return status;
    }
}
