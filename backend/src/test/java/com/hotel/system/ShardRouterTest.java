package com.hotel.system;

import com.hotel.system.service.ShardRouter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ShardRouterTest {

    @Test
    @DisplayName("ShardRouter deterministically routes identical keys to the same shard")
    public void testDeterministicShardRouting() {
        ShardRouter router = new ShardRouter();
        router.init();

        String shardA1 = router.routeKeyToShard("HTL-101");
        String shardA2 = router.routeKeyToShard("HTL-101");
        assertEquals(shardA1, shardA2);

        String shardB1 = router.routeKeyToShard("GST-9923");
        String shardB2 = router.routeKeyToShard("GST-9923");
        assertEquals(shardB1, shardB2);
    }
}
