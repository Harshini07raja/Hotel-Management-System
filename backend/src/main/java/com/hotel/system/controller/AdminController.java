package com.hotel.system.controller;

import com.hotel.system.dto.AdminDtos;
import com.hotel.system.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "System Design & Administration", description = "Diagnostics, Sharding, Consistent Hashing, Redis Cache, Rate Limiter, Snowflake benchmarks, and Metrics")
public class AdminController {

    private final ShardRouter shardRouter;
    private final ConsistentHashingService consistentHashingService;
    private final CacheService cacheService;
    private final RateLimiterService rateLimiterService;
    private final UniqueIdGeneratorService idGeneratorService;
    private final MetricsService metricsService;
    private final DataSeederService dataSeederService;

    public AdminController(ShardRouter shardRouter,
                           ConsistentHashingService consistentHashingService,
                           CacheService cacheService,
                           RateLimiterService rateLimiterService,
                           UniqueIdGeneratorService idGeneratorService,
                           MetricsService metricsService,
                           DataSeederService dataSeederService) {
        this.shardRouter = shardRouter;
        this.consistentHashingService = consistentHashingService;
        this.cacheService = cacheService;
        this.rateLimiterService = rateLimiterService;
        this.idGeneratorService = idGeneratorService;
        this.metricsService = metricsService;
        this.dataSeederService = dataSeederService;
    }

    // --- Shard Management (Component 2) ---
    @GetMapping("/shards")
    @Operation(summary = "List all active database shards and connection health")
    public ResponseEntity<Map<String, Object>> getShards() {
        return ResponseEntity.ok(shardRouter.getShardDistributionStats());
    }

    @GetMapping("/shards/distribution")
    @Operation(summary = "Get record distribution statistics across database shards")
    public ResponseEntity<Map<String, Object>> getShardDistribution() {
        return ResponseEntity.ok(shardRouter.getShardDistributionStats());
    }

    @PostMapping("/shards/add")
    @Operation(summary = "Dynamically add a new database shard to evaluate topology expansion (Experiment C)")
    public ResponseEntity<Map<String, Object>> addShard(@RequestParam String shardId,
                                                        @RequestParam String databaseName) {
        boolean added = shardRouter.addNewShard(shardId, databaseName);
        return ResponseEntity.ok(Map.of(
                "success", added,
                "shardId", shardId,
                "databaseName", databaseName,
                "message", added ? "New shard registered successfully." : "Shard already exists."
        ));
    }

    // --- Consistent Hashing (Component 3) ---
    @GetMapping("/consistent-hashing/ring")
    @Operation(summary = "Inspect consistent hash ring tokens and virtual nodes")
    public ResponseEntity<Map<String, Object>> getRing() {
        return ResponseEntity.ok(consistentHashingService.getRingDistributionStats());
    }

    @PostMapping("/consistent-hashing/servers")
    @Operation(summary = "Add an application server to the consistent hash ring")
    public ResponseEntity<Map<String, Object>> addServer(@RequestParam String serverId) {
        consistentHashingService.addServer(serverId);
        return ResponseEntity.ok(Map.of("message", "Server " + serverId + " added to consistent hash ring."));
    }

    @DeleteMapping("/consistent-hashing/servers/{serverId}")
    @Operation(summary = "Remove an application server from the consistent hash ring")
    public ResponseEntity<Map<String, Object>> removeServer(@PathVariable String serverId) {
        consistentHashingService.removeServer(serverId);
        return ResponseEntity.ok(Map.of("message", "Server " + serverId + " removed from consistent hash ring."));
    }

    @GetMapping("/consistent-hashing/benchmark")
    @Operation(summary = "Benchmark key migration comparing Modulo Hashing vs Consistent Hashing (Experiment D)")
    public ResponseEntity<Map<String, Object>> benchmarkConsistentHashing(
            @RequestParam(required = false, defaultValue = "10000") int sampleKeyCount) {
        return ResponseEntity.ok(consistentHashingService.compareTopologyChange(sampleKeyCount));
    }

    // --- Key-Value Cache (Component 4) ---
    @GetMapping("/cache/stats")
    @Operation(summary = "Get Redis cache hits, misses, hit rate, and latency")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        return ResponseEntity.ok(cacheService.getCacheStats());
    }

    @DeleteMapping("/cache/clear")
    @Operation(summary = "Evict all cached entries")
    public ResponseEntity<Map<String, Object>> clearCache() {
        cacheService.evictPrefix("");
        return ResponseEntity.ok(Map.of("message", "Cache cleared successfully."));
    }

    // --- Rate Limiter (Component 1) ---
    @GetMapping("/rate-limiter/stats")
    @Operation(summary = "Get rate limiter accepted, rejected, and latency metrics")
    public ResponseEntity<Map<String, Object>> getRateLimiterStats() {
        return ResponseEntity.ok(rateLimiterService.getRateLimiterStats());
    }

    // --- Unique ID Generator (Component 5) ---
    @GetMapping("/snowflake/benchmark")
    @Operation(summary = "Benchmark Snowflake ID generator under concurrent parallel threads (Experiment: collisions & throughput)")
    public ResponseEntity<Map<String, Object>> runSnowflakeBenchmark(
            @RequestParam(required = false, defaultValue = "50000") int totalIds,
            @RequestParam(required = false, defaultValue = "16") int threads) throws InterruptedException {
        return ResponseEntity.ok(idGeneratorService.runCollisionBenchmark(totalIds, threads));
    }

    // --- System Metrics & Telemetry ---
    @GetMapping("/metrics")
    @Operation(summary = "Get real-time application metrics (p50, p95, p99, throughput RPS, CPU, memory)")
    public ResponseEntity<AdminDtos.MetricsSummaryDto> getMetrics() {
        return ResponseEntity.ok(metricsService.getMetricsSummary());
    }

    @PostMapping("/seed-data")
    @Operation(summary = "Trigger demonstration dataset seeding")
    public ResponseEntity<Map<String, String>> seedData() {
        dataSeederService.seedAllData();
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Demonstration dataset seeded."));
    }

    @PostMapping("/reset-data")
    @Operation(summary = "Reset database and re-seed clean demonstration dataset")
    public ResponseEntity<Map<String, String>> resetData() {
        dataSeederService.resetAllData();
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Database reset and re-seeded."));
    }

    @GetMapping("/health")
    @Operation(summary = "System health check")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "hotel-management-system",
                "timestamp", System.currentTimeMillis()
        ));
    }
}
