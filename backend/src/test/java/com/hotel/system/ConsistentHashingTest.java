package com.hotel.system;

import com.hotel.system.service.ConsistentHashingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ConsistentHashingTest {

    @Test
    @DisplayName("Consistent Hashing distributes keys deterministically and preserves assignment")
    public void testDeterministicMapping() {
        ConsistentHashingService ch = new ConsistentHashingService(100);
        String server1 = ch.getServer("hotel-key-101");
        String server2 = ch.getServer("hotel-key-101");

        assertNotNull(server1);
        assertEquals(server1, server2, "Same key must map to identical server deterministically");
    }

    @Test
    @DisplayName("Consistent Hashing reassigns significantly fewer keys than Modulo Hashing when node is added")
    public void testTopologyChangeComparison() {
        ConsistentHashingService ch = new ConsistentHashingService(150);
        Map<String, Object> benchmark = ch.compareTopologyChange(5000);

        @SuppressWarnings("unchecked")
        Map<String, Object> modulo = (Map<String, Object>) benchmark.get("moduloHashing");
        @SuppressWarnings("unchecked")
        Map<String, Object> consistent = (Map<String, Object>) benchmark.get("consistentHashing");

        double moduloPct = (double) modulo.get("percentageMoved");
        double consistentPct = (double) consistent.get("percentageMoved");

        assertTrue(consistentPct < moduloPct,
                String.format("Consistent hashing (%.2f%%) must move far fewer keys than modulo hashing (%.2f%%)",
                        consistentPct, moduloPct));

        // When moving from 3 nodes to 4 nodes, modulo hashing moves ~75% of keys, while consistent hashing moves ~25%
        assertTrue(consistentPct < 35.0, "Consistent hashing key migration should be around ~25%");
        assertTrue(moduloPct > 65.0, "Modulo hashing key migration should be around ~75%");
    }
}
