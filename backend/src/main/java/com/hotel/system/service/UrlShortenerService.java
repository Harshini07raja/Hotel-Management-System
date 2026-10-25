package com.hotel.system.service;

import com.hotel.system.model.ShortUrl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * URL Shortener Service for shareable booking confirmation links.
 * Backed by Redis cache-aside and persistent MongoDB collection.
 */
@Service
public class UrlShortenerService {
    private static final Logger log = LoggerFactory.getLogger(UrlShortenerService.class);

    private final ShardRouter shardRouter;
    private final CacheService cacheService;
    private final UniqueIdGeneratorService idGenerator;

    public UrlShortenerService(ShardRouter shardRouter, CacheService cacheService, UniqueIdGeneratorService idGenerator) {
        this.shardRouter = shardRouter;
        this.cacheService = cacheService;
        this.idGenerator = idGenerator;
    }

    public ShortUrl createShortUrl(String bookingId, String targetUrl, String guestId) {
        // Generate a 7-character Base62 code
        String shortCode = idGenerator.nextShortCode();
        if (shortCode.length() > 7) {
            shortCode = shortCode.substring(shortCode.length() - 7);
        }

        ShortUrl record = new ShortUrl(shortCode, bookingId, targetUrl, guestId);
        record.setId("URL-" + idGenerator.nextRawId());

        // Save to primary shard
        MongoTemplate template = shardRouter.getShardTemplate("shard-0");
        template.save(record);

        // Cache in Redis / local cache with 30 days TTL
        cacheService.put("url:" + shortCode, record, 86400 * 30);
        log.info("Created short URL [code: {}, bookingId: {}]", shortCode, bookingId);
        return record;
    }

    public Optional<ShortUrl> resolveShortCode(String shortCode) {
        // 1. Check Cache
        ShortUrl cached = cacheService.get("url:" + shortCode, ShortUrl.class);
        if (cached != null) {
            cached.setClickCount(cached.getClickCount() + 1);
            return Optional.of(cached);
        }

        // 2. Query MongoDB
        MongoTemplate template = shardRouter.getShardTemplate("shard-0");
        Query query = new Query(Criteria.where("shortCode").is(shortCode));
        ShortUrl found = template.findOne(query, ShortUrl.class);

        if (found != null) {
            found.setClickCount(found.getClickCount() + 1);
            template.save(found);
            cacheService.put("url:" + shortCode, found, 86400 * 30);
            return Optional.of(found);
        }

        return Optional.empty();
    }
}
