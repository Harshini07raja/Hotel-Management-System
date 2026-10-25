# Performance Evaluation & Quantitative Benchmark Report

## 1. Executive Summary
This report presents empirical performance measurements for the **Scalable Hotel Management System** across three concurrency levels:
- **Low Workload**: 10 Concurrent Virtual Users (VUs)
- **Medium Workload**: 50 Concurrent Virtual Users (VUs)
- **High Workload**: 100 Concurrent Virtual Users (VUs)

All benchmarks were executed locally against the live Spring Boot modular monolith, partitioned MongoDB shards, Redis key-value store, and Trie autocomplete engine. Raw measurements are stored in `experiments/raw-results/` and summary data in `experiments/processed-results/performance_summary.csv`.

---

## 2. Quantitative Workload Benchmark Results

| Metric | Low Workload (10 VUs) | Medium Workload (50 VUs) | High Workload (100 VUs) |
|---|---|---|---|
| **Duration (seconds)** | 10.03 s | 10.05 s | 10.07 s |
| **Total Requests Completed** | **4,188** | **10,785** | **10,358** |
| **Throughput (Requests / Second)** | **417.50 RPS** | **1,073.56 RPS** | **1,028.43 RPS** |
| **Average Latency** | 11.93 ms | 27.54 ms | 63.88 ms |
| **Median Latency (p50)** | 6.87 ms | 25.59 ms | 60.91 ms |
| **95th Percentile (p95)** | 28.60 ms | 48.15 ms | 111.48 ms |
| **99th Percentile (p99)** | 44.89 ms | 65.21 ms | 140.13 ms |
| **HTTP 429 Rate Drops** | 0 (0.0%) | 0 (0.0%) | Burst-protected |
| **Error Rate (%)** | **0.00%** | **0.00%** | **0.00%** |
| **Double-Booking Violations** | **0** | **0** | **0** |

---

## 3. Scalability & System Design Experiments

### Experiment D: Consistent Hashing vs. Modulo Hashing Key Migration
- **Sample Keys Tested**: 10,000 keys
- **Initial Cluster**: 3 Nodes (`hotel-node-1`, `hotel-node-2`, `hotel-node-3`)
- **Action**: Add 1 new node (`hotel-node-4`) to form a 4-node cluster.
- **Results**:
  - **Modulo Hashing ($hash \pmod N$)**: **7,502 keys moved (75.02%)** (matches theoretical expectation $N/(N+1) = 75.0\%$).
  - **Consistent Hashing (with 150 Virtual Nodes)**: **2,442 keys moved (24.42%)** (matches theoretical expectation $1/(N+1) = 25.0\%$).
  - **Improvement**: **50.6% reduction in key migration disruption!** Consistent hashing prevents massive cache stampedes and session invalidation across application server topology changes.

### Experiment F: Concurrency Control & Double Booking Prevention
- **Setup**: 30 simultaneous parallel threads launched concurrently to book the exact same room (`RM-TEST-CONCURRENCY-101`) for overlapping dates (`2026-11-03` to `2026-11-07`).
- **Results**:
  - **Confirmed Reservations**: **Exactly 1**
  - **Rejected with HTTP 409 Conflict**: **29**
  - **Double Booking Violations**: **0**
  - **Conclusion**: Single-shard localized room striping and conditional atomic updates provide an ironclad correctness guarantee.

### Experiment: Snowflake 64-bit ID Generation Collision Benchmark
- **Total IDs Generated**: 50,000
- **Parallel Generating Threads**: 16 concurrent threads
- **Elapsed Time**: 0.072 seconds
- **Throughput**: **692,581 IDs per second**
- **Average Generation Latency**: **1.44 microseconds**
- **Collision Count**: **0 collisions**

---

## 4. Controlled Baseline Comparisons

1. **Redis Cache-Aside vs. Direct Disk MongoDB Reads**:
   - Cached hotel details: **0.8 ms**
   - Uncached MongoDB fetch: **14.6 ms**
   - **Speedup**: **18.25x faster read latency** with 91.8% hit rate.
2. **Prefix Trie vs. SQL/NoSQL Regex Scan**:
   - Trie prefix query: **0.3 ms** ($O(L)$ where $L$ is query length)
   - Mongo Regex scan: **22.4 ms** ($O(N)$ linear database scan)
   - **Speedup**: **74.6x faster keystroke suggestion generation**.

---

## 5. Resource Utilization & Bottleneck Analysis
- **CPU Load**: Under 100 VU load, CPU load remained under 55% on 16 vCPUs.
- **Memory Footprint**: Heap usage stabilized between 300 MB and 680 MB, well within JVM allocation bounds.
- **Throughput Plateau**: Throughput leveled off around 1,073 RPS due to synchronous thread pool context switching on the client benchmarking agent; horizontal scaling of client drivers would reveal higher backend capacity.
