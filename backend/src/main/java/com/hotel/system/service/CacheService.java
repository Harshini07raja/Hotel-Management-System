package com.hotel.system.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Multi-tier Key-Value Cache Service.
 * - Primary: Redis (via Spring Data Redis)
 * - Fallback: Resilient in-memory ConcurrentHashMap
 * 
 * Critical Correctness Rule:
 * Stale cached data is NEVER used as the sole authority for room booking availability!
 * Authoritative availability checks always verify against the MongoDB shard.
 */
@Service
public class CacheService {
    private static final Logger log = LoggerFactory.getLogger(CacheService.class);

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private final ObjectMapper objectMapper;

    public CacheService() {
        this(null);
    }

    public CacheService(@Autowired(required = false) ObjectMapper mapper) {
        if (mapper != null) {
            this.objectMapper = mapper;
        } else {
            ObjectMapper m = new ObjectMapper();
            m.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            m.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            this.objectMapper = m;
        }
    }

    // Resilient In-Memory Fallback Cache
    private final Map<String, CacheEntry> localCache = new ConcurrentHashMap<>();

    // Metrics counters
    private final AtomicLong hitCount = new AtomicLong(0);
    private final AtomicLong missCount = new AtomicLong(0);
    private final AtomicLong totalLookupLatencyNanos = new AtomicLong(0);

    private static class CacheEntry {
        final String value;
        final long expiresAtMillis;

        CacheEntry(String value, long ttlSeconds) {
            this.value = value;
            this.expiresAtMillis = ttlSeconds > 0 ? System.currentTimeMillis() + (ttlSeconds * 1000) : Long.MAX_VALUE;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiresAtMillis;
        }
    }

    public <T> T get(String key, Class<T> targetClass) {
        long start = System.nanoTime();
        String json = null;
        boolean hit = false;

        try {
            if (redisTemplate != null) {
                json = redisTemplate.opsForValue().get(key);
            }
        } catch (Exception e) {
            log.debug("Redis read failed for key {}, falling back to local cache: {}", key, e.getMessage());
        }

        if (json == null) {
            CacheEntry entry = localCache.get(key);
            if (entry != null) {
                if (entry.isExpired()) {
                    localCache.remove(key);
                } else {
                    json = entry.value;
                }
            }
        }

        long latency = System.nanoTime() - start;
        totalLookupLatencyNanos.addAndGet(latency);

        if (json != null) {
            hitCount.incrementAndGet();
            try {
                return objectMapper.readValue(json, targetClass);
            } catch (JsonProcessingException e) {
                log.warn("Failed to deserialize cached value for key {}: {}", key, e.getMessage());
                return null;
            }
        } else {
            missCount.incrementAndGet();
            return null;
        }
    }

    public void put(String key, Object value, long ttlSeconds) {
        try {
            String json = objectMapper.writeValueAsString(value);
            // 1. Try Redis
            try {
                if (redisTemplate != null) {
                    redisTemplate.opsForValue().set(key, json, Duration.ofSeconds(ttlSeconds));
                }
            } catch (Exception e) {
                log.debug("Redis write failed, storing in local fallback: {}", e.getMessage());
            }

            // 2. Always maintain in local cache as fallback
            localCache.put(key, new CacheEntry(json, ttlSeconds));
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize object for cache key {}: {}", key, e.getMessage());
        }
    }

    public void evict(String key) {
        try {
            if (redisTemplate != null) {
                redisTemplate.delete(key);
            }
        } catch (Exception e) {
            log.debug("Redis delete failed for key {}: {}", key, e.getMessage());
        }
        localCache.remove(key);
    }

    public void evictPrefix(String prefix) {
        localCache.keySet().removeIf(k -> k.startsWith(prefix));
        try {
            if (redisTemplate != null) {
                var keys = redisTemplate.keys(prefix + "*");
                if (keys != null && !keys.isEmpty()) {
                    redisTemplate.delete(keys);
                }
            }
        } catch (Exception e) {
            log.debug("Redis evictPrefix failed: {}", e.getMessage());
        }
    }

    public Map<String, Object> getCacheStats() {
        long hits = hitCount.get();
        long misses = missCount.get();
        long total = hits + misses;
        double hitRate = total > 0 ? (hits * 100.0 / total) : 0.0;
        double avgLatencyMs = total > 0 ? (totalLookupLatencyNanos.get() / (total * 1_000_000.0)) : 0.0;

        boolean isRedisActive = false;
        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                redisTemplate.getConnectionFactory().getConnection().ping();
                isRedisActive = true;
            }
        } catch (Exception ignored) {}

        Map<String, Object> stats = new java.util.LinkedHashMap<>();
        stats.put("cacheProvider", isRedisActive ? "REDIS_WITH_LOCAL_FALLBACK" : "LOCAL_IN_MEMORY_FALLBACK");
        stats.put("isRedisConnected", isRedisActive);
        stats.put("hitCount", hits);
        stats.put("missCount", misses);
        stats.put("totalRequests", total);
        stats.put("hitRatePercentage", Math.round(hitRate * 100.0) / 100.0);
        stats.put("activeLocalKeys", localCache.size());
        stats.put("avgLookupLatencyMs", Math.round(avgLatencyMs * 1000.0) / 1000.0);
        return stats;
    }
}
