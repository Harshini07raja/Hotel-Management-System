package com.hotel.system.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Consistent Hash Ring for Hotel Application Servers.
 * 
 * Implements:
 * - Hash ring using TreeMap
 * - 150 Virtual Nodes per physical server for uniform load distribution
 * - Server addition / removal
 * - Topology change rebalancing comparison vs Modulo Hashing
 */
@Service
public class ConsistentHashingService {
    private static final Logger log = LoggerFactory.getLogger(ConsistentHashingService.class);

    private static final int DEFAULT_VIRTUAL_NODES = 150;
    private final int virtualNodes;

    // The Hash Ring: Token -> Physical Server ID
    private final SortedMap<Long, String> ring = new TreeMap<>();
    private final Set<String> physicalServers = ConcurrentHashMap.newKeySet();
    private final Map<String, AtomicLong> serverRequestCounters = new ConcurrentHashMap<>();

    public ConsistentHashingService() {
        this(DEFAULT_VIRTUAL_NODES);
    }

    public ConsistentHashingService(int virtualNodes) {
        this.virtualNodes = virtualNodes;
        // Initialize default hotel cluster servers
        addServer("hotel-node-1");
        addServer("hotel-node-2");
        addServer("hotel-node-3");
    }

    public synchronized void addServer(String serverId) {
        if (physicalServers.contains(serverId)) return;
        physicalServers.add(serverId);
        serverRequestCounters.putIfAbsent(serverId, new AtomicLong(0));

        for (int i = 0; i < virtualNodes; i++) {
            long token = hash(serverId + "#vnode#" + i);
            ring.put(token, serverId);
        }
        log.info("Consistent Hash Ring: Added server {} ({} vnodes). Total tokens: {}", serverId, virtualNodes, ring.size());
    }

    public synchronized void removeServer(String serverId) {
        if (!physicalServers.contains(serverId)) return;
        physicalServers.remove(serverId);

        for (int i = 0; i < virtualNodes; i++) {
            long token = hash(serverId + "#vnode#" + i);
            ring.remove(token);
        }
        log.info("Consistent Hash Ring: Removed server {}. Remaining tokens: {}", serverId, ring.size());
    }

    /**
     * Finds the target server for a given key on the ring.
     * Uses binary search in TreeMap: ceilingEntry.
     */
    public String getServer(String key) {
        if (ring.isEmpty()) {
            throw new IllegalStateException("Consistent Hash Ring is empty!");
        }

        long hash = hash(key);
        SortedMap<Long, String> tailMap = ring.tailMap(hash);
        long targetToken = tailMap.isEmpty() ? ring.firstKey() : tailMap.firstKey();
        String selectedServer = ring.get(targetToken);

        AtomicLong counter = serverRequestCounters.get(selectedServer);
        if (counter != null) {
            counter.incrementAndGet();
        }
        return selectedServer;
    }

    /**
     * Benchmark comparison: Modulo Hashing vs Consistent Hashing key migration
     * when a new server node is added to a cluster of N nodes.
     */
    public Map<String, Object> compareTopologyChange(int sampleKeyCount) {
        List<String> currentNodes = new ArrayList<>(physicalServers);
        if (currentNodes.isEmpty()) {
            currentNodes = Arrays.asList("node-1", "node-2", "node-3");
        }
        int initialNodeCount = currentNodes.size();

        // 1. Modulo Hashing assignment before and after adding 1 node
        int moduloMovedKeys = 0;
        for (int i = 0; i < sampleKeyCount; i++) {
            String key = "hotel-request-key-" + i;
            int h = Math.abs(key.hashCode());
            int beforeIndex = h % initialNodeCount;
            int afterIndex = h % (initialNodeCount + 1);
            if (beforeIndex != afterIndex) {
                moduloMovedKeys++;
            }
        }
        double moduloMovePct = (moduloMovedKeys * 100.0) / sampleKeyCount;

        // 2. Consistent Hashing assignment before and after adding 1 node
        // Create baseline ring
        SortedMap<Long, String> testRing = new TreeMap<>();
        for (String node : currentNodes) {
            for (int v = 0; v < virtualNodes; v++) {
                testRing.put(hash(node + "#v#" + v), node);
            }
        }

        Map<String, String> baselineMap = new HashMap<>();
        for (int i = 0; i < sampleKeyCount; i++) {
            String key = "hotel-request-key-" + i;
            long h = hash(key);
            SortedMap<Long, String> tail = testRing.tailMap(h);
            long tok = tail.isEmpty() ? testRing.firstKey() : tail.firstKey();
            baselineMap.put(key, testRing.get(tok));
        }

        // Add newNode to test ring
        String newNode = "hotel-node-" + (initialNodeCount + 1);
        for (int v = 0; v < virtualNodes; v++) {
            testRing.put(hash(newNode + "#v#" + v), newNode);
        }

        int consistentMovedKeys = 0;
        for (int i = 0; i < sampleKeyCount; i++) {
            String key = "hotel-request-key-" + i;
            long h = hash(key);
            SortedMap<Long, String> tail = testRing.tailMap(h);
            long tok = tail.isEmpty() ? testRing.firstKey() : tail.firstKey();
            String newAssigned = testRing.get(tok);
            if (!newAssigned.equals(baselineMap.get(key))) {
                consistentMovedKeys++;
            }
        }
        double consistentMovePct = (consistentMovedKeys * 100.0) / sampleKeyCount;

        Map<String, Object> comparison = new LinkedHashMap<>();
        comparison.put("sampleKeyCount", sampleKeyCount);
        comparison.put("initialNodeCount", initialNodeCount);
        comparison.put("newNodeAdded", newNode);

        Map<String, Object> moduloResult = new LinkedHashMap<>();
        moduloResult.put("keysMoved", moduloMovedKeys);
        moduloResult.put("percentageMoved", Math.round(moduloMovePct * 100.0) / 100.0);
        moduloResult.put("theoreticalExpectedPct", Math.round((initialNodeCount * 100.0 / (initialNodeCount + 1)) * 100.0) / 100.0);
        comparison.put("moduloHashing", moduloResult);

        Map<String, Object> consistentResult = new LinkedHashMap<>();
        consistentResult.put("keysMoved", consistentMovedKeys);
        consistentResult.put("percentageMoved", Math.round(consistentMovePct * 100.0) / 100.0);
        consistentResult.put("theoreticalExpectedPct", Math.round((100.0 / (initialNodeCount + 1)) * 100.0) / 100.0);
        comparison.put("consistentHashing", consistentResult);

        comparison.put("reductionInKeyMovement", Math.round((moduloMovePct - consistentMovePct) * 100.0) / 100.0 + "% less keys migrated");
        return comparison;
    }

    public Map<String, Object> getRingDistributionStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("activeServers", new ArrayList<>(physicalServers));
        stats.put("virtualNodesPerServer", virtualNodes);
        stats.put("totalRingTokens", ring.size());

        Map<String, Long> requestStats = new LinkedHashMap<>();
        for (String s : physicalServers) {
            requestStats.put(s, serverRequestCounters.getOrDefault(s, new AtomicLong(0)).get());
        }
        stats.put("serverRequestCounts", requestStats);

        // Sample test keys distribution
        Map<String, Integer> sampleDist = new HashMap<>();
        for (String s : physicalServers) sampleDist.put(s, 0);
        for (int i = 0; i < 1000; i++) {
            String s = getServer("sample-hotel-" + i);
            sampleDist.put(s, sampleDist.getOrDefault(s, 0) + 1);
        }
        stats.put("sample1000KeyDistribution", sampleDist);
        return stats;
    }

    private long hash(String key) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(key.getBytes());
            // Pack first 8 bytes into 64-bit integer
            long h = 0;
            for (int i = 0; i < 8; i++) {
                h = (h << 8) | (digest[i] & 0xFF);
            }
            return h & 0x7FFFFFFFFFFFFFFFL; // positive 63-bit integer
        } catch (NoSuchAlgorithmException e) {
            return Math.abs((long) key.hashCode());
        }
    }
}
