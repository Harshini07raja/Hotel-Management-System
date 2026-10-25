package com.hotel.system;

import com.hotel.system.util.SnowflakeIdGenerator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

public class SnowflakeIdGeneratorTest {

    @Test
    @DisplayName("Snowflake generates non-null, strictly increasing IDs under single thread")
    public void testSequentialIdGeneration() {
        SnowflakeIdGenerator generator = new SnowflakeIdGenerator(1, 1);
        long prev = 0;
        for (int i = 0; i < 1000; i++) {
            long current = generator.nextId();
            assertTrue(current > prev, "Snowflake IDs must be monotonically increasing");
            prev = current;
        }
    }

    @Test
    @DisplayName("Snowflake generates zero collisions across 16 parallel threads generating 50,000 IDs")
    public void testConcurrentCollisions() throws InterruptedException {
        SnowflakeIdGenerator generator = new SnowflakeIdGenerator(2, 1);
        int threadCount = 16;
        int idsPerThread = 3125; // 16 * 3125 = 50,000 total IDs
        int totalExpected = threadCount * idsPerThread;

        Set<Long> set = ConcurrentHashMap.newKeySet();
        AtomicInteger collisions = new AtomicInteger(0);

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch finish = new CountDownLatch(threadCount);

        for (int t = 0; t < threadCount; t++) {
            executor.submit(() -> {
                try {
                    start.await();
                    for (int i = 0; i < idsPerThread; i++) {
                        long id = generator.nextId();
                        if (!set.add(id)) {
                            collisions.incrementAndGet();
                        }
                    }
                } catch (InterruptedException ignored) {
                } finally {
                    finish.countDown();
                }
            });
        }

        start.countDown();
        boolean completed = finish.await(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(completed, "Benchmark should complete within 15 seconds");
        assertEquals(0, collisions.get(), "Snowflake must produce 0 collisions under high concurrency");
        assertEquals(totalExpected, set.size(), "Set must contain exactly 50,000 unique IDs");
    }

    @Test
    @DisplayName("Base62 short encoding generates compact non-empty codes")
    public void testBase62Encoding() {
        String code1 = SnowflakeIdGenerator.Base62.encode(123456789L);
        assertNotNull(code1);
        assertFalse(code1.isEmpty());
        assertTrue(code1.matches("[0-9a-zA-Z]+"));
    }
}
