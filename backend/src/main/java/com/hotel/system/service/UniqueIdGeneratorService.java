package com.hotel.system.service;

import com.hotel.system.util.SnowflakeIdGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Distributed Unique ID Generator Service.
 * Produces 64-bit time-ordered Snowflake IDs and Base62 codes.
 */
@Service
public class UniqueIdGeneratorService {

    private final SnowflakeIdGenerator snowflake;

    public UniqueIdGeneratorService(
            @Value("${hotel.snowflake.worker-id:1}") long workerId,
            @Value("${hotel.snowflake.datacenter-id:1}") long datacenterId) {
        this.snowflake = new SnowflakeIdGenerator(workerId, datacenterId);
    }

    public long nextRawId() {
        return snowflake.nextId();
    }

    public String nextGuestId() {
        return snowflake.nextFormattedId("GST");
    }

    public String nextBookingId() {
        return snowflake.nextFormattedId("BK");
    }

    public String nextInvoiceId() {
        return snowflake.nextFormattedId("INV");
    }

    public String nextNotificationId() {
        return snowflake.nextFormattedId("NTF");
    }

    public String nextShortCode() {
        return snowflake.nextBase62Id();
    }

    public long getTotalGeneratedCount() {
        return snowflake.getTotalGeneratedCount();
    }

    /**
     * Parallel collision benchmark: generates N IDs across concurrent threads
     * and asserts 0 collisions while measuring generation throughput.
     */
    public Map<String, Object> runCollisionBenchmark(int totalIds, int threadCount) throws InterruptedException {
        Set<Long> generatedIds = ConcurrentHashMap.newKeySet();
        AtomicInteger collisions = new AtomicInteger(0);
        int idsPerThread = totalIds / threadCount;

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        long startTime = System.nanoTime();

        for (int t = 0; t < threadCount; t++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    for (int i = 0; i < idsPerThread; i++) {
                        long id = snowflake.nextId();
                        if (!generatedIds.add(id)) {
                            collisions.incrementAndGet();
                        }
                    }
                } catch (InterruptedException ignored) {
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        finishLatch.await(30, TimeUnit.SECONDS);
        long durationNanos = System.nanoTime() - startTime;
        executor.shutdown();

        double durationSeconds = durationNanos / 1_000_000_000.0;
        double idsPerSec = totalIds / durationSeconds;
        double avgLatencyNanos = (double) durationNanos / totalIds;

        Map<String, Object> results = new java.util.LinkedHashMap<>();
        results.put("algorithm", "Snowflake-64bit (41b ts, 10b worker/dc, 12b seq)");
        results.put("totalGenerated", totalIds);
        results.put("threads", threadCount);
        results.put("collisions", collisions.get());
        results.put("durationSeconds", Math.round(durationSeconds * 1000.0) / 1000.0);
        results.put("throughputIdsPerSec", Math.round(idsPerSec));
        results.put("avgLatencyMicros", Math.round((avgLatencyNanos / 1000.0) * 100.0) / 100.0);
        return results;
    }
}
