package com.hotel.system.service;

import com.hotel.system.dto.AdminDtos;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

/**
 * System Observability & Telemetry Metrics Service.
 * Tracks latency percentiles (p50, p95, p99), throughput, errors, CPU, and memory.
 */
@Service
public class MetricsService {

    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong successfulRequests = new AtomicLong(0);
    private final AtomicLong errorRequests = new AtomicLong(0);
    private final AtomicLong totalLatencyMs = new AtomicLong(0);

    private final Map<String, AtomicLong> endpointHits = new ConcurrentHashMap<>();
    private final ConcurrentLinkedQueue<Long> recentResponseTimesMs = new ConcurrentLinkedQueue<>();
    private static final int MAX_SAMPLES = 5000;

    private final long startTime = System.currentTimeMillis();

    public void recordRequest(String endpoint, long durationMs, boolean isSuccess) {
        totalRequests.incrementAndGet();
        totalLatencyMs.addAndGet(durationMs);

        if (isSuccess) {
            successfulRequests.incrementAndGet();
        } else {
            errorRequests.incrementAndGet();
        }

        endpointHits.computeIfAbsent(endpoint, k -> new AtomicLong(0)).incrementAndGet();

        recentResponseTimesMs.add(durationMs);
        if (recentResponseTimesMs.size() > MAX_SAMPLES) {
            recentResponseTimesMs.poll();
        }
    }

    public AdminDtos.MetricsSummaryDto getMetricsSummary() {
        long total = totalRequests.get();
        long success = successfulRequests.get();
        long errors = errorRequests.get();
        double errorRate = total > 0 ? (errors * 100.0 / total) : 0.0;
        double avgLatency = total > 0 ? (totalLatencyMs.get() * 1.0 / total) : 0.0;

        List<Long> latencies = new ArrayList<>(recentResponseTimesMs);
        Collections.sort(latencies);

        double p50 = getPercentile(latencies, 50);
        double p95 = getPercentile(latencies, 95);
        double p99 = getPercentile(latencies, 99);

        long uptimeSeconds = Math.max(1, (System.currentTimeMillis() - startTime) / 1000);
        double throughputRps = total * 1.0 / uptimeSeconds;

        Runtime runtime = Runtime.getRuntime();
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        double cpu = osBean.getSystemLoadAverage();
        if (cpu < 0) cpu = 0.15; // default fallback if load average unavailable on Windows

        long totalMem = runtime.totalMemory() / (1024 * 1024);
        long freeMem = runtime.freeMemory() / (1024 * 1024);
        long usedMem = totalMem - freeMem;

        Map<String, Long> hits = new LinkedHashMap<>();
        endpointHits.forEach((k, v) -> hits.put(k, v.get()));

        AdminDtos.MetricsSummaryDto dto = new AdminDtos.MetricsSummaryDto();
        dto.setTotalRequests(total);
        dto.setSuccessRequests(success);
        dto.setErrorRequests(errors);
        dto.setErrorRatePercentage(Math.round(errorRate * 100.0) / 100.0);
        dto.setAvgResponseTimeMs(Math.round(avgLatency * 100.0) / 100.0);
        dto.setP50ResponseTimeMs(p50);
        dto.setP95ResponseTimeMs(p95);
        dto.setP99ResponseTimeMs(p99);
        dto.setThroughputRps(Math.round(throughputRps * 100.0) / 100.0);
        dto.setCpuUtilization(Math.round(cpu * 100.0) / 100.0);
        dto.setUsedMemoryMb(usedMem);
        dto.setTotalMemoryMb(totalMem);
        dto.setEndpointHits(hits);
        return dto;
    }

    private double getPercentile(List<Long> sorted, double percentile) {
        if (sorted.isEmpty()) return 0.0;
        int index = (int) Math.ceil((percentile / 100.0) * sorted.size()) - 1;
        index = Math.max(0, Math.min(index, sorted.size() - 1));
        return sorted.get(index);
    }
}
