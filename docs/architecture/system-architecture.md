# Scalable Hotel Management System - Architectural Diagrams

## 1. Overall System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Presentation Tier (React + Vite + TypeScript)"]
        UI["React SPA Dashboard (Port 3000)"]
        TrieUI["Trie Keystroke Autocomplete"]
        ResUI["Reservation & Payment Simulation"]
        OpsUI["Front Desk & Housekeeping Dashboard"]
        AdminUI["Telemetry & Shard Visualizer"]
    end

    subgraph GatewayTier["API Routing & Security Tier (Spring Boot 3.3 / Port 8088)"]
        CORS["CORS & Request Filter"]
        JWTFilter["JWT Authentication Filter"]
        RateLimiter["Token Bucket Rate Limiter (Redis / Local Fallback)"]
    end

    subgraph ServiceTier["Backend Modular Monolith Services"]
        AuthSvc["AuthenticationService"]
        HotelSvc["HotelService"]
        AvailSvc["AvailabilityService"]
        BookingSvc["BookingService (Room-Level Striped Lock)"]
        CheckInOutSvc["CheckInCheckOutService"]
        HousekeepingSvc["HousekeepingService"]
        BillingSvc["BillingService (BigDecimal Decimal-Safe)"]
        NotifSvc["NotificationService"]
        CrawlerSvc["HotelCrawlerService"]
        ShortUrlSvc["UrlShortenerService (Base62)"]
        SnowflakeSvc["SnowflakeIdGenerator (64-bit, 0 Collisions)"]
        ConsistentHashSvc["ConsistentHashingService (150 Virtual Nodes)"]
        MetricsSvc["MetricsService (p50, p95, p99, RPS)"]
    end

    subgraph CacheTier["In-Memory & Distributed Key-Value Store"]
        RedisCache[("Redis 7.2 (Port 6379)\nCache-Aside • Short URLs • Rate Limits")]
    end

    subgraph ShardRouterTier["Explicit Deterministic Shard Router"]
        Router["ShardRouter: hash(Key) % N"]
    end

    subgraph StorageTier["Partitioned MongoDB Storage Tier"]
        Shard0[("MongoDB Shard 0 (Port 27017)\nhotel_shard_0")]
        Shard1[("MongoDB Shard 1 (Port 27018)\nhotel_shard_1")]
        Shard2[("MongoDB Shard 2 (Port 27019)\nhotel_shard_2")]
        Shard3[("MongoDB Shard 3 (Dynamically Added)\nhotel_shard_3")]
    end

    subgraph ExternalMockTier["Competitor Reference Data"]
        MockSites["3 Mock Hotel Websites (Grand Azure, Emerald Bay, Solaris)"]
    end

    UI --> GatewayTier
    GatewayTier --> ServiceTier
    ServiceTier <--> RedisCache
    ServiceTier --> ShardRouterTier
    ShardRouterTier --> Shard0
    ShardRouterTier --> Shard1
    ShardRouterTier --> Shard2
    ShardRouterTier -.-> Shard3
    CrawlerSvc --> MockSites
```

---

## 2. Request Flow: From React Frontend Through Backend Services

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Guest (Browser)
    participant UI as React Frontend
    participant Filter as JWT & Rate Limiter Filter
    participant Controller as BookingController
    participant Svc as BookingService
    participant Cache as Redis Key-Value Store
    participant Router as ShardRouter
    participant Shard as Authoritative MongoDB Shard

    Guest->>UI: Select Room & Dates [checkIn, checkOut)
    UI->>Filter: POST /api/v1/bookings (with JWT & Idempotency-Key)
    Filter->>Filter: Check Token Bucket (Consume token)
    alt Rate Limit Exceeded
        Filter-->>UI: HTTP 429 Too Many Requests (Retry-After)
    else Token Available
        Filter->>Controller: Route to Controller
        Controller->>Svc: createBooking(request)
        Svc->>Svc: Verify Idempotency Key
        Svc->>Svc: Acquire Striped Room Lock
        Svc->>Router: Query active overlapping bookings
        Router->>Shard: Count overlaps on hotel's shard
        Shard-->>Router: Overlap Count = 0
        Svc->>Svc: Calculate price (Nightly Snapshot × Nights)
        Svc->>Router: Save Booking & Invoice
        Router->>Shard: Atomic Insert
        Svc->>Cache: Evict stale hotel search & availability cache
        Svc-->>Controller: Confirmed Booking Object
        Controller-->>UI: HTTP 200 Confirmed (Booking ID & Short URL)
        UI-->>Guest: Render Confirmation Banner & Short URL
    end
```

---

## 3. Concurrent Booking & Double-Booking Prevention Flow

```mermaid
sequenceDiagram
    autonumber
    actor GuestA as Guest A (Thread 1)
    actor GuestB as Guest B (Thread 2)
    participant Lock as Striped Room Lock
    participant Shard as Authoritative MongoDB Shard

    Note over GuestA,GuestB: Simultaneous booking requests for Room 101 on overlapping dates [Nov 1 - Nov 5)
    
    par Thread 1 Attempts Reservation
        GuestA->>Lock: Acquire roomLock("RM-101")
        Note over Lock: Lock granted to Thread 1
        Lock->>Shard: Query overlapping reservations: [Nov 1, Nov 5)
        Shard-->>Lock: 0 overlapping records found
        Lock->>Shard: Insert confirmed booking (BK-1)
        Note over Lock: Release roomLock("RM-101")
        Lock-->>GuestA: HTTP 200 Confirmed!
    and Thread 2 Attempts Reservation
        GuestB->>Lock: Acquire roomLock("RM-101")
        Note over Lock: Thread 2 blocks until Thread 1 finishes
        Note over Lock: Lock granted to Thread 2
        Lock->>Shard: Query overlapping reservations: [Nov 1, Nov 5)
        Shard-->>Lock: 1 overlapping record found (BK-1 exists!)
        Note over Lock: Release roomLock("RM-101")
        Lock-->>GuestB: HTTP 409 Conflict: Room already reserved!
    end
```

---

## 4. Shard-Routing Architecture

```mermaid
flowchart TD
    Inbound["Inbound Request (Hotel, Room, Booking, or Guest)"] --> Router{"ShardRouter: Determine Shard Key"}
    
    Router -->|"hotelId (Hotels, Rooms, Bookings)"| ColocateRule["Co-location Rule: Hash(hotelId) % N\nEnsures room & bookings live on SAME shard!"]
    Router -->|"guestId (Profiles, Inboxes)"| GuestRule["Hash(guestId) % N"]
    Router -->|"Cross-Shard Search (e.g. City = 'Paris')"| ScatterGather["Scatter-Gather Query Engine"]

    ColocateRule --> TargetShard{"Target Shard Index"}
    TargetShard -->|Index 0| Shard0[("hotel_shard_0")]
    TargetShard -->|Index 1| Shard1[("hotel_shard_1")]
    TargetShard -->|Index 2| Shard2[("hotel_shard_2")]

    ScatterGather --> Shard0
    ScatterGather --> Shard1
    ScatterGather --> Shard2
    Shard0 --> Merge["In-Memory Aggregation & Sorting"]
    Shard1 --> Merge
    Shard2 --> Merge
    Merge --> Response["Unified JSON Response"]
```

---

## 5. Consistent Hashing Ring & Virtual Nodes

```mermaid
flowchart LR
    subgraph HashRing["Consistent Hash Ring (2^64 Token Space)"]
        N1_V1["Node 1 (vnode 0)"] --> N2_V1["Node 2 (vnode 0)"]
        N2_V1 --> N3_V1["Node 3 (vnode 0)"]
        N3_V1 --> N1_V2["Node 1 (vnode 1)"]
        N1_V2 --> N2_V2["Node 2 (vnode 1)"]
        N2_V2 --> N3_V2["Node 3 (vnode 1)"]
        N3_V2 --> N1_V1
    end

    Key["Hotel Request Key: hash(hotelId)"] --> RingLookup["Binary Search: TreeMap.ceilingEntry(hash)"]
    RingLookup --> AssignedServer["Selected Hotel Application Server"]
```

---

## 6. Redis Cache-Aside Flow with Write-Through Invalidation

```mermaid
flowchart TD
    Req["Hotel Detail Request: GET /api/v1/hotels/HTL-101"] --> CacheCheck{"Cache Hit in Redis?\n(key: 'hotel:HTL-101')"}
    CacheCheck -->|Yes (Hit)| ReturnCached["Return Cached JSON (< 1ms)"]
    CacheCheck -->|No (Miss)| QueryShard["Fetch from Authoritative Mongo Shard (12ms)"]
    QueryShard --> StoreCache["Store in Redis (TTL: 3600s)"]
    StoreCache --> ReturnFresh["Return Fresh JSON"]

    BookingMade["Event: Room Booked or Status Changed"] --> Invalidate["Evict 'hotel:HTL-101' & 'search:*' from Redis"]
    Invalidate --> ConsistentState["Guarantees Next Query Reads Fresh State"]
```

---

## 7. Web Crawler Architecture

```mermaid
flowchart TD
    Trigger["Crawler Trigger: POST /api/v1/crawler/run"] --> Frontier["URL Frontier Queue"]
    Frontier --> VisitedCheck{"URL in Visited Set?"}
    VisitedCheck -->|Yes| Skip["Skip (Prevents infinite loops)"]
    VisitedCheck -->|No| Delay["Polite Crawl Delay (200ms)"]
    Delay --> Fetcher["HTTP Client (Jsoup)"]
    Fetcher --> Mock1["Mock Site 1: Grand Azure Resort"]
    Fetcher --> Mock2["Mock Site 2: Emerald Bay Suites"]
    Fetcher --> Mock3["Mock Site 3: Solaris Mountain Retreat"]
    Mock1 --> Parser["Jsoup HTML DOM Parser"]
    Mock2 --> Parser
    Mock3 --> Parser
    Parser --> Extract["Extract Rates, Amenities, Room Types, Ratings, Reviews"]
    Extract --> Normalize["Normalize into ExternalHotelData Entity"]
    Normalize --> MongoStore[("Save to external_hotel_data\n(Isolated from authoritative inventory)")]
```
