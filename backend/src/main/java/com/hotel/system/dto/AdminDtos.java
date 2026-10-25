package com.hotel.system.dto;

import java.util.List;
import java.util.Map;

public class AdminDtos {

    public static class ShardStatusDto {
        private String shardId;
        private String database;
        private Map<String, Long> recordCounts;
        private boolean isHealthy;
        private long pingTimeMs;

        public ShardStatusDto() {}
        public ShardStatusDto(String shardId, String database, Map<String, Long> recordCounts, boolean isHealthy, long pingTimeMs) {
            this.shardId = shardId;
            this.database = database;
            this.recordCounts = recordCounts;
            this.isHealthy = isHealthy;
            this.pingTimeMs = pingTimeMs;
        }

        public String getShardId() { return shardId; }
        public void setShardId(String shardId) { this.shardId = shardId; }
        public String getDatabase() { return database; }
        public void setDatabase(String database) { this.database = database; }
        public Map<String, Long> getRecordCounts() { return recordCounts; }
        public void setRecordCounts(Map<String, Long> recordCounts) { this.recordCounts = recordCounts; }
        public boolean isHealthy() { return isHealthy; }
        public void setHealthy(boolean healthy) { isHealthy = healthy; }
        public long getPingTimeMs() { return pingTimeMs; }
        public void setPingTimeMs(long pingTimeMs) { this.pingTimeMs = pingTimeMs; }
    }

    public static class ConsistentHashRingDto {
        private List<String> activeServers;
        private int virtualNodesPerServer;
        private int totalRingTokens;
        private Map<String, Integer> keyDistribution;
        private double distributionStdDev;
        private long lookupLatencyNanos;

        public ConsistentHashRingDto() {}

        public List<String> getActiveServers() { return activeServers; }
        public void setActiveServers(List<String> activeServers) { this.activeServers = activeServers; }
        public int getVirtualNodesPerServer() { return virtualNodesPerServer; }
        public void setVirtualNodesPerServer(int virtualNodesPerServer) { this.virtualNodesPerServer = virtualNodesPerServer; }
        public int getTotalRingTokens() { return totalRingTokens; }
        public void setTotalRingTokens(int totalRingTokens) { this.totalRingTokens = totalRingTokens; }
        public Map<String, Integer> getKeyDistribution() { return keyDistribution; }
        public void setKeyDistribution(Map<String, Integer> keyDistribution) { this.keyDistribution = keyDistribution; }
        public double getDistributionStdDev() { return distributionStdDev; }
        public void setDistributionStdDev(double distributionStdDev) { this.distributionStdDev = distributionStdDev; }
        public long getLookupLatencyNanos() { return lookupLatencyNanos; }
        public void setLookupLatencyNanos(long lookupLatencyNanos) { this.lookupLatencyNanos = lookupLatencyNanos; }
    }

    public static class CacheStatsDto {
        private long hitCount;
        private long missCount;
        private double hitRatePercentage;
        private long totalRequests;
        private int activeKeys;
        private String cacheProvider; // "REDIS" or "IN_MEMORY_FALLBACK"
        private double avgLookupLatencyMs;

        public CacheStatsDto() {}

        public long getHitCount() { return hitCount; }
        public void setHitCount(long hitCount) { this.hitCount = hitCount; }
        public long getMissCount() { return missCount; }
        public void setMissCount(long missCount) { this.missCount = missCount; }
        public double getHitRatePercentage() { return hitRatePercentage; }
        public void setHitRatePercentage(double hitRatePercentage) { this.hitRatePercentage = hitRatePercentage; }
        public long getTotalRequests() { return totalRequests; }
        public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
        public int getActiveKeys() { return activeKeys; }
        public void setActiveKeys(int activeKeys) { this.activeKeys = activeKeys; }
        public String getCacheProvider() { return cacheProvider; }
        public void setCacheProvider(String cacheProvider) { this.cacheProvider = cacheProvider; }
        public double getAvgLookupLatencyMs() { return avgLookupLatencyMs; }
        public void setAvgLookupLatencyMs(double avgLookupLatencyMs) { this.avgLookupLatencyMs = avgLookupLatencyMs; }
    }

    public static class RateLimiterStatsDto {
        private long totalChecked;
        private long acceptedRequests;
        private long rejectedRequests;
        private double rejectionPercentage;
        private double avgLatencyMs;
        private int activeBuckets;
        private String implementation; // "REDIS_TOKEN_BUCKET" or "LOCAL_TOKEN_BUCKET"

        public RateLimiterStatsDto() {}

        public long getTotalChecked() { return totalChecked; }
        public void setTotalChecked(long totalChecked) { this.totalChecked = totalChecked; }
        public long getAcceptedRequests() { return acceptedRequests; }
        public void setAcceptedRequests(long acceptedRequests) { this.acceptedRequests = acceptedRequests; }
        public long getRejectedRequests() { return rejectedRequests; }
        public void setRejectedRequests(long rejectedRequests) { this.rejectedRequests = rejectedRequests; }
        public double getRejectionPercentage() { return rejectionPercentage; }
        public void setRejectionPercentage(double rejectionPercentage) { this.rejectionPercentage = rejectionPercentage; }
        public double getAvgLatencyMs() { return avgLatencyMs; }
        public void setAvgLatencyMs(double avgLatencyMs) { this.avgLatencyMs = avgLatencyMs; }
        public int getActiveBuckets() { return activeBuckets; }
        public void setActiveBuckets(int activeBuckets) { this.activeBuckets = activeBuckets; }
        public String getImplementation() { return implementation; }
        public void setImplementation(String implementation) { this.implementation = implementation; }
    }

    public static class MetricsSummaryDto {
        private long totalRequests;
        private long successRequests;
        private long errorRequests;
        private double errorRatePercentage;
        private double avgResponseTimeMs;
        private double p50ResponseTimeMs;
        private double p95ResponseTimeMs;
        private double p99ResponseTimeMs;
        private double throughputRps;
        private double cpuUtilization;
        private long usedMemoryMb;
        private long totalMemoryMb;
        private Map<String, Long> endpointHits;

        public MetricsSummaryDto() {}

        public long getTotalRequests() { return totalRequests; }
        public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
        public long getSuccessRequests() { return successRequests; }
        public void setSuccessRequests(long successRequests) { this.successRequests = successRequests; }
        public long getErrorRequests() { return errorRequests; }
        public void setErrorRequests(long errorRequests) { this.errorRequests = errorRequests; }
        public double getErrorRatePercentage() { return errorRatePercentage; }
        public void setErrorRatePercentage(double errorRatePercentage) { this.errorRatePercentage = errorRatePercentage; }
        public double getAvgResponseTimeMs() { return avgResponseTimeMs; }
        public void setAvgResponseTimeMs(double avgResponseTimeMs) { this.avgResponseTimeMs = avgResponseTimeMs; }
        public double getP50ResponseTimeMs() { return p50ResponseTimeMs; }
        public void setP50ResponseTimeMs(double p50ResponseTimeMs) { this.p50ResponseTimeMs = p50ResponseTimeMs; }
        public double getP95ResponseTimeMs() { return p95ResponseTimeMs; }
        public void setP95ResponseTimeMs(double p95ResponseTimeMs) { this.p95ResponseTimeMs = p95ResponseTimeMs; }
        public double getP99ResponseTimeMs() { return p99ResponseTimeMs; }
        public void setP99ResponseTimeMs(double p99ResponseTimeMs) { this.p99ResponseTimeMs = p99ResponseTimeMs; }
        public double getThroughputRps() { return throughputRps; }
        public void setThroughputRps(double throughputRps) { this.throughputRps = throughputRps; }
        public double getCpuUtilization() { return cpuUtilization; }
        public void setCpuUtilization(double cpuUtilization) { this.cpuUtilization = cpuUtilization; }
        public long getUsedMemoryMb() { return usedMemoryMb; }
        public void setUsedMemoryMb(long usedMemoryMb) { this.usedMemoryMb = usedMemoryMb; }
        public long getTotalMemoryMb() { return totalMemoryMb; }
        public void setTotalMemoryMb(long totalMemoryMb) { this.totalMemoryMb = totalMemoryMb; }
        public Map<String, Long> getEndpointHits() { return endpointHits; }
        public void setEndpointHits(Map<String, Long> endpointHits) { this.endpointHits = endpointHits; }
    }
}
