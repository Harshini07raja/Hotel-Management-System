package com.hotel.system;

import com.hotel.system.service.RateLimiterService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class RateLimiterTest {

    @Test
    @DisplayName("Rate Limiter allows requests within capacity and blocks bursts exceeding bucket limits")
    public void testTokenBucketBurst() {
        RateLimiterService limiter = new RateLimiterService();
        String testIp = "192.168.1.100";

        // Login bucket has capacity 10
        for (int i = 0; i < 10; i++) {
            var result = limiter.checkLimit(testIp, "LOGIN");
            assertTrue(result.isAllowed(), "Request " + (i + 1) + " within burst capacity should be allowed");
        }

        // 11th request must be rejected with HTTP 429 semantics (allowed == false, retryAfter > 0)
        var rejected = limiter.checkLimit(testIp, "LOGIN");
        assertFalse(rejected.isAllowed(), "Request exceeding burst capacity must be rejected");
        assertTrue(rejected.getRetryAfterSeconds() > 0, "Rejected request must specify retry-after interval");
    }
}
