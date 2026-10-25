package com.hotel.system.service;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Explicit Shard Router for Partitioned MongoDB.
 * Manages multiple independent shard databases (hotel_shard_0, hotel_shard_1, hotel_shard_2).
 * 
 * Routing Policies:
 * - Hotels & Rooms: sharded by hotelId (co-located on same shard).
 * - Bookings: sharded by hotelId (ensures single-shard room reservation locking).
 * - Guests: sharded by guestId.
 * - Cross-shard queries: executed via parallel scatter-gather and merged.
 */
@Service
public class ShardRouter {
    private static final Logger log = LoggerFactory.getLogger(ShardRouter.class);

    @Value("${hotel.sharding.base-uri:mongodb://localhost:27017}")
    private String baseUri = "mongodb://localhost:27017";

    private MongoClient mongoClient;
    private final List<String> shardIds = new ArrayList<>();
    private final Map<String, MongoTemplate> shardTemplates = new ConcurrentHashMap<>();

    public ShardRouter() {}

    public ShardRouter(String baseUri) {
        this.baseUri = baseUri != null ? baseUri : "mongodb://localhost:27017";
    }

    @PostConstruct
    public void init() {
        if (!shardIds.contains("shard-0")) shardIds.add("shard-0");
        if (!shardIds.contains("shard-1")) shardIds.add("shard-1");
        if (!shardIds.contains("shard-2")) shardIds.add("shard-2");

        try {
            if (baseUri != null) {
                this.mongoClient = MongoClients.create(baseUri);
                // Initialize 3 default shards
                registerShard("shard-0", "hotel_shard_0");
                registerShard("shard-1", "hotel_shard_1");
                registerShard("shard-2", "hotel_shard_2");
                log.info("ShardRouter successfully initialized with {} active shards.", shardIds.size());
            }
        } catch (Exception e) {
            log.warn("MongoDB connection warning for ShardRouter (routing logic remains active): {}", e.getMessage());
        }
    }

    public synchronized void registerShard(String shardId, String databaseName) {
        if (!shardTemplates.containsKey(shardId)) {
            MongoTemplate template = new MongoTemplate(mongoClient, databaseName);
            shardTemplates.put(shardId, template);
            if (!shardIds.contains(shardId)) {
                shardIds.add(shardId);
            }
            log.info("Registered Shard [{} -> {}]", shardId, databaseName);
        }
    }

    /**
     * Dynamically adds a new shard (e.g. hotel_shard_3) to test shard addition (Experiment C).
     */
    public synchronized boolean addNewShard(String shardId, String databaseName) {
        if (shardTemplates.containsKey(shardId)) {
            return false;
        }
        registerShard(shardId, databaseName);
        return true;
    }

    public MongoTemplate getTemplateForHotel(String hotelId) {
        String shardId = routeKeyToShard(hotelId);
        return shardTemplates.get(shardId);
    }

    public MongoTemplate getTemplateForGuest(String guestId) {
        String shardId = routeKeyToShard(guestId);
        return shardTemplates.get(shardId);
    }

    public MongoTemplate getTemplateForBooking(String hotelId) {
        // Bookings are co-located with their hotel to maintain atomic room locking!
        String shardId = routeKeyToShard(hotelId);
        return shardTemplates.get(shardId);
    }

    public MongoTemplate getShardTemplate(String shardId) {
        return shardTemplates.get(shardId);
    }

    public List<MongoTemplate> getAllShardTemplates() {
        return new ArrayList<>(shardTemplates.values());
    }

    public List<String> getActiveShardIds() {
        return Collections.unmodifiableList(shardIds);
    }

    /**
     * Deterministic Murmur-style hash routing:
     * maps key to shard index: abs(hash(key)) % N
     */
    public String routeKeyToShard(String key) {
        if (key == null || shardIds.isEmpty()) return shardIds.get(0);
        int hash = Math.abs(key.hashCode());
        int index = hash % shardIds.size();
        return shardIds.get(index);
    }

    /**
     * Scatter-gather execution across all shards for cross-shard entity search.
     */
    public <T> List<T> scatterGather(Query query, Class<T> entityClass) {
        List<T> aggregatedResults = new ArrayList<>();
        for (MongoTemplate template : shardTemplates.values()) {
            try {
                List<T> shardResults = template.find(query, entityClass);
                aggregatedResults.addAll(shardResults);
            } catch (Exception e) {
                log.warn("Scatter-gather query failed on a shard: {}", e.getMessage());
            }
        }
        return aggregatedResults;
    }

    /**
     * Find entity by ID across shards (short-circuits as soon as found).
     */
    public <T> Optional<T> findByIdAcrossShards(Object id, Class<T> entityClass) {
        for (MongoTemplate template : shardTemplates.values()) {
            try {
                T entity = template.findById(id, entityClass);
                if (entity != null) {
                    return Optional.of(entity);
                }
            } catch (Exception e) {
                log.warn("Lookup failed on shard: {}", e.getMessage());
            }
        }
        return Optional.empty();
    }

    /**
     * Collects statistics and record counts across all shards.
     */
    public Map<String, Object> getShardDistributionStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalShards", shardIds.size());
        stats.put("shardList", shardIds);

        List<Map<String, Object>> shardDetails = new ArrayList<>();
        long totalHotels = 0;
        long totalRooms = 0;
        long totalBookings = 0;
        long totalGuests = 0;

        for (String shardId : shardIds) {
            MongoTemplate template = shardTemplates.get(shardId);
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("shardId", shardId);
            detail.put("databaseName", template.getDb().getName());

            try {
                long start = System.currentTimeMillis();
                long guests = template.getCollection("guests").countDocuments();
                long hotels = template.getCollection("hotels").countDocuments();
                long rooms = template.getCollection("rooms").countDocuments();
                long bookings = template.getCollection("bookings").countDocuments();
                long invoices = template.getCollection("invoices").countDocuments();
                long ping = System.currentTimeMillis() - start;

                detail.put("isHealthy", true);
                detail.put("pingMs", ping);
                detail.put("guestCount", guests);
                detail.put("hotelCount", hotels);
                detail.put("roomCount", rooms);
                detail.put("bookingCount", bookings);
                detail.put("invoiceCount", invoices);

                totalHotels += hotels;
                totalRooms += rooms;
                totalBookings += bookings;
                totalGuests += guests;
            } catch (Exception e) {
                detail.put("isHealthy", false);
                detail.put("error", e.getMessage());
            }
            shardDetails.add(detail);
        }

        stats.put("shards", shardDetails);
        stats.put("aggregateHotels", totalHotels);
        stats.put("aggregateRooms", totalRooms);
        stats.put("aggregateBookings", totalBookings);
        stats.put("aggregateGuests", totalGuests);
        return stats;
    }

    @PreDestroy
    public void cleanup() {
        if (mongoClient != null) {
            mongoClient.close();
        }
    }
}
