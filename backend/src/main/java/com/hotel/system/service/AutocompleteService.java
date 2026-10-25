package com.hotel.system.service;

import com.hotel.system.model.Hotel;
import com.hotel.system.util.Trie;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Prefix Autocomplete Service.
 * Features:
 * - In-memory Trie structure with multi-category terms (HOTEL, CITY, AMENITY)
 * - Popularity and rating ranking
 * - Sub-millisecond prefix searches
 * - Redis prefix query caching
 */
@Service
public class AutocompleteService {
    private static final Logger log = LoggerFactory.getLogger(AutocompleteService.class);

    private final Trie trie = new Trie();
    private final ShardRouter shardRouter;
    private final CacheService cacheService;

    private final AtomicLong queryCount = new AtomicLong(0);
    private final AtomicLong totalQueryLatencyNanos = new AtomicLong(0);

    public AutocompleteService(ShardRouter shardRouter, CacheService cacheService) {
        this.shardRouter = shardRouter;
        this.cacheService = cacheService;
    }

    public synchronized void reindex() {
        trie.clear();
        List<Hotel> allHotels = shardRouter.scatterGather(new Query(), Hotel.class);

        for (Hotel hotel : allHotels) {
            long score = (long) (hotel.getStarRating() * 100) + hotel.getPopularityScore();
            // 1. Hotel name
            trie.insert(hotel.getName(), "HOTEL", score, hotel.getId());
            // 2. City
            trie.insert(hotel.getCity(), "CITY", score + 500, hotel.getCity());
            // 3. Amenities
            if (hotel.getAmenities() != null) {
                for (String amenity : hotel.getAmenities()) {
                    trie.insert(amenity, "AMENITY", 50, amenity);
                }
            }
        }
        log.info("Autocomplete index rebuilt. Total terms in Trie: {}", trie.getTotalTermsCount());
    }

    public List<Trie.Suggestion> getSuggestions(String prefix, int limit) {
        long start = System.nanoTime();
        queryCount.incrementAndGet();

        if (prefix == null) prefix = "";
        String cacheKey = "ac:" + prefix.trim().toLowerCase() + ":" + limit;

        // Check cache
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> cached = cacheService.get(cacheKey, List.class);
        if (cached != null) {
            long latency = System.nanoTime() - start;
            totalQueryLatencyNanos.addAndGet(latency);
            List<Trie.Suggestion> converted = new ArrayList<>();
            for (Map<String, Object> map : cached) {
                converted.add(new Trie.Suggestion(
                        (String) map.get("term"),
                        (String) map.get("category"),
                        ((Number) map.get("score")).longValue(),
                        (String) map.get("referenceId")
                ));
            }
            return converted;
        }

        List<Trie.Suggestion> results = trie.searchPrefix(prefix, limit);
        long latency = System.nanoTime() - start;
        totalQueryLatencyNanos.addAndGet(latency);

        // Cache frequent queries for 10 minutes
        cacheService.put(cacheKey, results, 600);
        return results;
    }

    public Map<String, Object> getAutocompleteStats() {
        long count = queryCount.get();
        double avgLatencyMs = count > 0 ? (totalQueryLatencyNanos.get() / (count * 1_000_000.0)) : 0.0;

        Map<String, Object> stats = new java.util.LinkedHashMap<>();
        stats.put("totalIndexedTerms", trie.getTotalTermsCount());
        stats.put("totalQueries", count);
        stats.put("avgLookupLatencyMs", Math.round(avgLatencyMs * 1000.0) / 1000.0);
        return stats;
    }
}
