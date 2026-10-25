package com.hotel.system.util;

import java.util.concurrent.atomic.AtomicLong;

/**
 * 64-bit Distributed Snowflake ID Generator.
 * Structure:
 * - 1 unused sign bit (always 0)
 * - 41 bits: Timestamp in milliseconds since custom epoch (supports ~69 years)
 * - 5 bits: Datacenter ID (0 - 31)
 * - 5 bits: Worker ID (0 - 31)
 * - 12 bits: Sequence counter (0 - 4095 per millisecond per node)
 */
public class SnowflakeIdGenerator {
    // Custom epoch: 2026-01-01 00:00:00 UTC (in milliseconds)
    private static final long EPOCH = 1767225600000L;

    private static final long WORKER_ID_BITS = 5L;
    private static final long DATACENTER_ID_BITS = 5L;
    private static final long SEQUENCE_BITS = 12L;

    private static final long MAX_WORKER_ID = ~(-1L << WORKER_ID_BITS);
    private static final long MAX_DATACENTER_ID = ~(-1L << DATACENTER_ID_BITS);
    private static final long SEQUENCE_MASK = ~(-1L << SEQUENCE_BITS);

    private static final long WORKER_ID_SHIFT = SEQUENCE_BITS;
    private static final long DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;
    private static final long TIMESTAMP_LEFT_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS;

    private final long workerId;
    private final long datacenterId;

    private long sequence = 0L;
    private long lastTimestamp = -1L;

    private final AtomicLong totalGeneratedCount = new AtomicLong(0);

    public SnowflakeIdGenerator(long workerId, long datacenterId) {
        if (workerId > MAX_WORKER_ID || workerId < 0) {
            throw new IllegalArgumentException(String.format("Worker Id can't be greater than %d or less than 0", MAX_WORKER_ID));
        }
        if (datacenterId > MAX_DATACENTER_ID || datacenterId < 0) {
            throw new IllegalArgumentException(String.format("Datacenter Id can't be greater than %d or less than 0", MAX_DATACENTER_ID));
        }
        this.workerId = workerId;
        this.datacenterId = datacenterId;
    }

    public synchronized long nextId() {
        long currentTimestamp = timeGen();

        // Handle backward clock drift
        if (currentTimestamp < lastTimestamp) {
            long offset = lastTimestamp - currentTimestamp;
            if (offset <= 5) {
                // Short drift: spin-wait until clock catches up
                try {
                    Thread.sleep(offset + 1);
                    currentTimestamp = timeGen();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Clock rollback waiting interrupted", e);
                }
            } else {
                throw new RuntimeException(String.format("Clock moved backwards. Refusing to generate id for %d milliseconds", offset));
            }
        }

        if (lastTimestamp == currentTimestamp) {
            sequence = (sequence + 1) & SEQUENCE_MASK;
            if (sequence == 0) {
                // Sequence overflow within the current millisecond: spin to next millisecond
                currentTimestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }

        lastTimestamp = currentTimestamp;
        totalGeneratedCount.incrementAndGet();

        return ((currentTimestamp - EPOCH) << TIMESTAMP_LEFT_SHIFT)
                | (datacenterId << DATACENTER_ID_SHIFT)
                | (workerId << WORKER_ID_SHIFT)
                | sequence;
    }

    public String nextFormattedId(String prefix) {
        return prefix + "-" + nextId();
    }

    public String nextBase62Id() {
        return Base62.encode(nextId());
    }

    public long getTotalGeneratedCount() {
        return totalGeneratedCount.get();
    }

    private long tilNextMillis(long lastTimestamp) {
        long timestamp = timeGen();
        while (timestamp <= lastTimestamp) {
            timestamp = timeGen();
        }
        return timestamp;
    }

    private long timeGen() {
        return System.currentTimeMillis();
    }

    /**
     * Base62 encoder for short URLs and compact identifiers.
     */
    public static class Base62 {
        private static final String ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        public static String encode(long num) {
            num = Math.abs(num);
            if (num == 0) return "0";
            StringBuilder sb = new StringBuilder();
            while (num > 0) {
                int rem = (int) (num % 62);
                sb.append(ALPHABET.charAt(rem));
                num /= 62;
            }
            return sb.reverse().toString();
        }
    }
}
