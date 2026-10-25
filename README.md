# Aurevia Hotels & Resorts — Scalable Distributed Hotel Management System
## Complete Full-Stack Implementation, Distributed Systems Design, and Empirical Performance Evaluation

[![Java](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Sharded%20(3%20Shards)-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache%20%26%20Rate%20Limiter-red.svg)](https://redis.io/)

A complete, runnable, production-grade prototype of a **Scalable Hotel Management System** built for system-design demonstrations, academic research, and enterprise architecture benchmarking. The frontend is branded as **Aurevia Hotels & Resorts** — a luxury hospitality platform with fully role-separated staff portals and a polished guest-facing booking experience.

---

## 1. System Overview

The system is built as a high-performance **Modular Monolith** integrating eight distributed systems design components into a unified full-stack application. It addresses core challenges of large-scale hospitality platforms: extreme read-to-write traffic ratios, seasonal booking spikes, inventory hotspots, and strict prevention of double-booking anomalies under concurrent transactions.

```
                          [ React 18 + Vite SPA — Aurevia Hotels & Resorts ]
                     (TypeScript 5.6, Tailwind CSS 3.4, Lucide Icons, Axios)
                                              |
                     ┌────────────────────────┼────────────────────────┐
                     │  Public Layout          │  Staff Portals         │  Admin Layout
                     │  (Navbar + Footer)      │  (Dedicated Sidebars)  │  (Full sidebar)
                     │  Landing, Search,       │  /staff/reception      │  /admin
                     │  Hotel Detail,          │  /staff/housekeeping   │  (7 sub-pages)
                     │  Guest Dashboard        │                        │
                     └────────────────────────┴────────────────────────┘
                                              |
                                              │ HTTP / REST (Port 8088)
                                              ▼
   ┌───────────────────────────────────────────────────────────────────────────────────┐
   │                      Spring Boot 3.3.4 Backend Modular Monolith                   │
   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────────┐   │
   │  │  Security / JWT  │  │ Rate Limiter (TB) │  │ Autocomplete Engine (Trie)   │   │
   │  ├──────────────────┤  ├──────────────────┤  ├──────────────────────────────┤   │
   │  │  Booking Service │  │ CheckIn/Out Svc  │  │ Housekeeping Service          │   │
   │  ├──────────────────┤  ├──────────────────┤  ├──────────────────────────────┤   │
   │  │ Snowflake ID Gen │  │ URL Shortener B62│  │ Competitor Web Crawler        │   │
   │  ├──────────────────┤  ├──────────────────┤  ├──────────────────────────────┤   │
   │  │ CacheService(KV) │  │ ShardRouter      │  │ Consistent Hashing (Ring)     │   │
   └──┴──────────────────┴──┴──────────────────┴──┴──────────────────────────────┴───┘
               │                        │                          │
               ▼                        ▼                          ▼
     ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
     │  Redis / Fallback│    │  MongoDB Shard 0 │    │  MongoDB Shard 1 │
     │  (L2 Key-Value)  │    │  Hotels, Rooms,  │    │  Hotels, Rooms,  │
     └──────────────────┘    │  Bookings        │    │  Bookings        │
                             └──────────────────┘    └──────────────────┘
```

---

## 2. Integrated Distributed System Design Components

| Component | Technical Implementation | Purpose & Architectural Justification |
|---|---|---|
| **1. Token Bucket Rate Limiter** | `RateLimiterService` (Capacity: 100, Refill: 50.0/sec) | Defends against DoS and brute-force reservation submission; returns HTTP 429 when exhausted. |
| **2. Database Sharding Layer** | `ShardRouter` (MurmurHash3 across independent shard DBs) | Partitions hotels, rooms, and bookings by `hotelId` for single-shard transactional locking without 2PC. |
| **3. Consistent Hashing Ring** | `ConsistentHashingService` (150 virtual nodes/node, `TreeMap`) | Distributes server workloads evenly; achieves **50.6% reduction in key migrations** vs. modulo hashing. |
| **4. Multi-Tier Key-Value Cache** | `CacheService` (Cache-Aside Redis + `ConcurrentHashMap` fallback) | Achieves **93.23% cache hit ratio** with sub-millisecond read latency. |
| **5. Twitter Snowflake 64-bit ID Gen** | `SnowflakeIdGenerator` (time bit-packing, zero coordination) | Generates **692,581 IDs/second** with monotonic ordering and 0 collisions across concurrent threads. |
| **6. Base62 URL Shortener** | `UrlShortenerService` (Snowflake ID → Base62 encoding) | Generates concise booking reference links (`/s/{shortCode}`) with atomic click tracking and 302 redirection. |
| **7. Competitor Web Crawler** | `HotelCrawlerService` (async HTML scrapers) | Crawls simulated competitor hotel endpoints to collect real-time room categories, rates, and amenities. |
| **8. Prefix Trie Autocomplete** | `Trie` (prefix tree with popularity scoring) | Delivers instant (<0.12 ms) autocomplete recommendations for hotel names, cities, and amenities. |

---

## 3. Technology Stack & Prerequisites

### Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3.4, Maven 3.9+, Spring Security (JWT), Spring Data MongoDB, Spring Data Redis, Actuator, Swagger/OpenAPI 3 |
| **Frontend** | React 18.3, Vite 5.4, TypeScript 5.6, Tailwind CSS 3.4, Axios, Lucide React |
| **Databases** | MongoDB Community (port 27017, 3 independent shard databases), Redis (port 6379, resilient in-memory fallback built-in) |
| **Testing** | JUnit 5, Spring Boot Test, Maven Surefire, Python 3.10+ (load test suite) |

### Prerequisites

- **Java Development Kit**: Java 17 or higher — `java -version`
- **Apache Maven**: 3.9 or higher — `mvn -version`
- **Node.js & npm**: Node.js 18+ and npm 9+ — `node -v`, `npm -v`
- **MongoDB**: Running locally on port 27017 — `mongod`
- **Python** *(optional, for load tests)*: 3.8 or higher

> [!NOTE]
> **Port 8088**: The backend runs on port **8088** (not 8080) to avoid conflicts with Oracle Database / TNSLSNR on Windows. This is pre-configured across `application.yml`, the Vite proxy, and all load-test scripts.

---

## 4. Pre-Seeded Demonstration Accounts

The application seeds accounts, hotels, rooms, and bookings across all shards on first startup.

| Role | Email | Password | Portal & Permissions |
|---|---|---|---|
| **GUEST** | `guest@hotel.com` | `Password123!` | Public booking engine: search, availability, reserve, pay, manage bookings. Redirects to `/my-account` after login. |
| **RECEPTIONIST** | `receptionist@hotel.com` | `Password123!` | Dedicated front-desk portal at `/staff/reception`: arrivals, departures, reservations, guest lookup, room availability, billing. |
| **HOUSEKEEPING** | `housekeeping@hotel.com` | `Password123!` | Dedicated housekeeping portal at `/staff/housekeeping`: task queue, status transitions (DIRTY → CLEANING → CLEAN → INSPECTION), maintenance. |
| **ADMIN** | `admin@hotel.com` | `Password123!` | Full admin console at `/admin`: hotels, bookings, guests, billing, system health, reports, pricing, system design dashboards. |

> **Quick Switch**: The login page (`/login`) includes a **Demo Credentials** panel — click any role tile to auto-fill the email and password, then submit.

---

## 5. Quick-Start Guide (Windows PowerShell)

```powershell
cd C:\Users\bhara\hotel-management-system
```

### Step 5.1 — Run the Test Suite
```powershell
.\scripts\run-tests.ps1
```
Expected: **Tests run: 12, Failures: 0, Errors: 0, BUILD SUCCESS**

### Step 5.2 — Start the Backend
```powershell
.\scripts\start-backend.ps1
```
Verify at `http://localhost:8088/swagger-ui/index.html` or `http://localhost:8088/api/v1/hotels`.

### Step 5.3 — Start the Frontend
Open a second PowerShell terminal:
```powershell
cd frontend
npm install        # first run only
npm run dev
```
Open `http://localhost:3000`.

### Step 5.4 — Build for Production
```powershell
cd frontend
npm run build      # tsc + vite build → dist/
```

---

## 6. Frontend Application — Routes & Portals

The frontend is a single-page application with three layout shells and role-based access control enforced by `ProtectedRoute`.

### 6.1 Public Layout (`PublicLayout` — Navbar + Footer)

| Route | Page | Description |
|---|---|---|
| `/` | `LandingPage` | Hero with `SearchForm`, featured hotels, destinations, amenities, reviews. |
| `/hotels` | `SearchResultsPage` | Filtered hotel search with compact `SearchForm` bar. |
| `/hotels/:hotelId` | `HotelDetailPage` | Hotel detail, room availability calendar, booking form. |
| `/offers` | `OffersPage` | Promotional offers and packages. |
| `/about` | `AboutPage` | Brand story and team. |
| `/contact` | `ContactPage` | Contact form and property addresses. |
| `/login` | `AuthPage` | Login / register with demo credential quick-fill panel. |
| `/register` | `AuthPage` (register mode) | Guest self-registration. |
| `/booking-confirmation/:bookingId` | `BookingConfirmationPage` | Post-booking summary and short-link display. |
| `/my-account` | `GuestDashboardPage` | Overview and upcoming stays. |
| `/my-account/bookings` | `GuestDashboardPage` | Full booking history with status filter and cancel action. |
| `/my-account/bookings/:bookingId` | `InvoicePaymentPage` | Invoice line items and simulated payment. |
| `/my-account/invoices` | `InvoicePaymentPage` | Invoice lookup. |
| `/my-account/notifications` | `NotificationsPage` | In-app notification inbox. |
| `/my-account/profile` | `GuestProfilePage` | Guest profile and preferences. |

### 6.2 Reception Portal (`ReceptionLayout` — collapsible sidebar)

Accessible to roles **RECEPTIONIST** and **ADMIN**. Redirects here automatically after receptionist login.

| Route | Page | Description |
|---|---|---|
| `/staff/reception` | `DashboardPage` | Front-desk overview: today's arrivals/departures metrics, quick check-in/check-out actions. |
| `/staff/reception/arrivals` | `ArrivalsPage` | Guests arriving today (status `CONFIRMED`, check-in date = today). One-click check-in with confirmation dialog. |
| `/staff/reception/departures` | `DeparturesPage` | Guests departing today (status `CHECKED_IN`, check-out date = today). One-click check-out; auto-creates housekeeping task. |
| `/staff/reception/reservations` | `ReservationsPage` | Paginated, searchable, filterable full reservation list. |
| `/staff/reception/guests` | `GuestLookupPage` | Search guests by name or email; shows grouped booking history. |
| `/staff/reception/rooms` | `RoomAvailabilityPage` | Tonight's room grid per property with available/occupied status. |
| `/staff/reception/billing` | `ReceptionBillingPage` | Invoice lookup by booking ID; displays payment status and line items. |

### 6.3 Housekeeping Portal (`HousekeepingLayout` — fixed sidebar with live task counters)

Accessible to roles **HOUSEKEEPING** and **ADMIN**. Redirects here automatically after housekeeping login.

| Route | Page | Description |
|---|---|---|
| `/staff/housekeeping` | `MyTasksPage` | All tasks with filter tabs (ALL / DIRTY / CLEANING / CLEAN / INSPECTION), status stats, and per-card status advance. |
| `/staff/housekeeping/to-clean` | `RoomsToCleanPage` | Tasks with status `DIRTY`. Start Cleaning button advances to `CLEANING`. |
| `/staff/housekeeping/in-progress` | `InProgressPage` | Tasks with status `CLEANING`. Mark Clean button advances to `CLEAN`. |
| `/staff/housekeeping/clean` | `CleanReadyPage` | Tasks with status `CLEAN` (awaiting inspection) and `INSPECTION` (ready for guests). |
| `/staff/housekeeping/maintenance` | `MaintenancePage` | Tasks with maintenance keywords in notes; Report Issue form creates new tasks. |
| `/staff/housekeeping/history` | `HistoryPage` | Completed tasks (status `INSPECTION`), searchable by room number. |

### 6.4 Admin Portal (`AdminLayout` — full management sidebar)

Accessible to role **ADMIN** only.

| Route | Page | Description |
|---|---|---|
| `/admin` | `AdminDashboardPage` | Revenue, bookings, occupancy metrics and system health overview. |
| `/admin/hotels` | `AdminHotelsPage` | Hotel inventory management. |
| `/admin/pricing` | `PricingPage` | Room pricing configuration. |
| `/admin/bookings` | `AdminBookingsPage` | Full booking management across all guests. |
| `/admin/guests` | `AdminGuestsPage` | Guest account management. |
| `/admin/housekeeping` | `AdminHousekeepingPage` | Housekeeping task management across all properties. |
| `/admin/billing` | `AdminBillingPage` | Invoice and payment management. |
| `/admin/reports` | `ReportsPage` | Monthly revenue charts and booking analytics. |
| `/admin/system-health` | `SystemHealthPage` | Live JVM metrics, cache stats, rate-limiter telemetry. |
| `/admin/system-design` | `SystemDesignPage` | Tabbed system-design dashboard: shard visualizer, consistent hashing ring, cache/rate-limiter demo, crawler, autocomplete lab, performance benchmarks. |
| `/admin/settings` | `SettingsPage` | Application settings. |

### 6.5 Legacy Redirects

| Old Path | Redirects To |
|---|---|
| `/receptionist` | `/staff/reception` |
| `/housekeeping` | `/staff/housekeeping` |
| `/dashboard`, `/profile`, `/notifications` | `/my-account/*` |
| `/shards`, `/consistent-hashing`, `/cache-ratelimit`, `/crawler`, `/autocomplete-demo`, `/performance` | `/admin/system-design` |

---

## 7. Frontend Component Architecture

```
frontend/src/
├── App.tsx                          # Root router — all routes, layout shells, ProtectedRoute wiring
├── brand.ts                         # Centralized brand config (name, tagline, colors, links)
├── main.tsx                         # React DOM entry point
├── index.css                        # Global CSS design system (Tailwind + custom component classes)
│
├── api/
│   └── client.ts                    # Axios instance with JWT Bearer interceptor and 401 handler
│
├── context/
│   └── AuthContext.tsx              # Auth state, login/register/logout, quickSwitchRole
│
├── types/
│   └── index.ts                     # Shared TypeScript interfaces: User, Hotel, Room, Booking,
│                                    # Invoice, HousekeepingTask, NotificationItem, Suggestion
│
├── layouts/
│   ├── PublicLayout.tsx             # Navbar + <Outlet> + Footer
│   ├── ReceptionLayout.tsx          # Collapsible sidebar (7 nav items) + header + <Outlet>
│   ├── HousekeepingLayout.tsx       # Fixed sidebar with live task badge counts + <Outlet>
│   └── AdminLayout.tsx              # Full management sidebar + <Outlet>
│
├── components/
│   ├── Navbar.tsx                   # Public navigation bar with auth state and role-aware links
│   ├── Footer.tsx                   # Brand footer with navigation links from brand.ts
│   ├── StatusBadge.tsx              # Legacy status badge (used by old dashboard pages)
│   ├── AutocompleteSearchBar.tsx    # Standalone autocomplete input (used on search results page)
│   │
│   ├── hotel/
│   │   ├── SearchForm.tsx           # Hero search form (standard) + compact inline variant
│   │   │                            # Grid layout: 1-col mobile, 2-col tablet, 4-col desktop
│   │   │                            # Icons in label rows (not overlaid on inputs)
│   │   ├── GuestSelector.tsx        # +/- guest count control with min/max bounds
│   │   ├── HotelCard.tsx            # Hotel listing card with image, rating, price, amenities
│   │   └── RoomCard.tsx             # Room card with type badge, capacity, nightly rate
│   │
│   └── ui/
│       ├── BookingStatusBadge.tsx   # Status pill: PENDING/CONFIRMED/CHECKED_IN/CHECKED_OUT/CANCELLED
│       ├── RoomStatusBadge.tsx      # Status pill: room status + housekeeping status values
│       ├── ConfirmationDialog.tsx   # Modal dialog for destructive/important actions (danger/warning/info)
│       ├── DataTable.tsx            # Reusable sortable/filterable table component
│       ├── EmptyState.tsx           # Empty content placeholder (icon in label row, not overlaid)
│       ├── ErrorState.tsx           # Error display with retry action
│       ├── LoadingSkeleton.tsx      # Shimmer skeletons: hotel-card / list-item / stat-card / table-row / text-block
│       ├── MetricCard.tsx           # KPI card with icon, label, value, optional trend
│       └── ProtectedRoute.tsx       # Role-based route guard; redirects to role's portal on mismatch
│
└── pages/
    ├── LandingPage.tsx              # Hero, search, featured hotels, destinations, rooms, amenities, reviews
    ├── SearchResultsPage.tsx        # Hotel search with compact form bar and client-side filters
    ├── HotelDetailPage.tsx          # Hotel info, room availability checker, booking form
    ├── BookingConfirmationPage.tsx  # Post-booking summary
    ├── AuthPage.tsx                 # Login + register with demo credential quick-fill
    ├── GuestDashboardPage.tsx       # My Account: overview + bookings list + cancel
    ├── GuestProfilePage.tsx         # Profile and preferences
    ├── InvoicePaymentPage.tsx       # Invoice line items and simulated payment
    ├── NotificationsPage.tsx        # In-app notification inbox
    ├── OffersPage.tsx               # Promotional offers
    ├── AboutPage.tsx                # Brand story
    ├── ContactPage.tsx              # Contact form
    ├── AdminDashboardPage.tsx       # Admin overview metrics
    │
    ├── admin/                       # Admin sub-pages (all under AdminLayout)
    │   ├── AdminHotelsPage.tsx
    │   ├── AdminBookingsPage.tsx
    │   ├── AdminGuestsPage.tsx
    │   ├── AdminHousekeepingPage.tsx
    │   ├── AdminBillingPage.tsx
    │   ├── PricingPage.tsx
    │   ├── ReportsPage.tsx
    │   ├── SystemHealthPage.tsx
    │   ├── SystemDesignPage.tsx     # Tabbed: shards / hashing / cache / crawler / autocomplete / perf
    │   └── SettingsPage.tsx
    │
    └── staff/
        ├── reception/               # All under ReceptionLayout (/staff/reception/*)
        │   ├── DashboardPage.tsx    # Front-desk overview with arrivals/departures and quick actions
        │   ├── ArrivalsPage.tsx     # Today's expected check-ins
        │   ├── DeparturesPage.tsx   # Today's expected check-outs
        │   ├── ReservationsPage.tsx # Paginated full reservation list
        │   ├── GuestLookupPage.tsx  # Guest search by name/email
        │   ├── RoomAvailabilityPage.tsx  # Tonight's room grid
        │   └── ReceptionBillingPage.tsx  # Invoice lookup by booking ID
        │
        └── housekeeping/            # All under HousekeepingLayout (/staff/housekeeping/*)
            ├── MyTasksPage.tsx      # All tasks with filter tabs and status advance cards
            ├── RoomsToCleanPage.tsx # DIRTY tasks — start cleaning
            ├── InProgressPage.tsx   # CLEANING tasks — mark clean
            ├── CleanReadyPage.tsx   # CLEAN / INSPECTION tasks — inspect and confirm
            ├── MaintenancePage.tsx  # Maintenance-flagged tasks + report issue form
            └── HistoryPage.tsx      # Completed (INSPECTION) task history
```

---

## 8. Backend REST API Summary

All endpoints are documented interactively at `http://localhost:8088/swagger-ui/index.html`.

| Controller | Base Path | Key Endpoints | Auth |
|---|---|---|---|
| `AuthController` | `/api/v1/auth` | `POST /login`, `POST /register`, `GET /me` | Public |
| `HotelController` | `/api/v1/hotels` | `GET /`, `GET /{id}`, `GET /{id}/rooms` | Public |
| `AvailabilityController` | `/api/v1/availability` | `GET /?hotelId&checkIn&checkOut&guests` | Public |
| `SearchController` | `/api/v1/search` | `GET /autocomplete?q=` | Public |
| `BookingController` | `/api/v1/bookings` | `POST /`, `GET /{id}`, `GET /` (staff), `POST /{id}/check-in`, `POST /{id}/check-out`, `POST /{id}/cancel` | Auth / RECEPTIONIST+ADMIN for list and check-in/out |
| `BillingController` | `/api/v1` | `GET /bookings/{id}/invoice`, `POST /bookings/{id}/payment`, `GET /invoices/{id}` | Auth |
| `HousekeepingController` | `/api/v1/housekeeping` | `GET /tasks?hotelId&status`, `POST /tasks`, `PATCH /tasks/{id}` | HOUSEKEEPING / RECEPTIONIST / ADMIN |
| `GuestController` | `/api/v1/guests` | `GET /me`, `GET /me/bookings`, `PUT /me` | Auth |
| `NotificationController` | `/api/v1/notifications` | `GET /`, `PATCH /{id}/read`, `POST /mark-all-read` | Auth |
| `AdminController` | `/api/v1/admin` | `GET /metrics`, `GET /shards`, `GET /cache-stats`, `POST /cache/purge` | ADMIN |
| `CrawlerController` | `/api/v1/crawler` | `POST /crawl`, `GET /results` | ADMIN |
| `UrlShortenerController` | `/api/v1/short-urls`, `/s/{code}` | `POST /`, `GET /s/{code}` (redirect) | Public |

### Role-Based Security (Spring Security)

| Endpoint Pattern | Permitted Roles |
|---|---|
| `/api/v1/auth/**`, `/api/v1/hotels/**`, `/api/v1/search/**`, `/api/v1/availability/**`, `/api/v1/short-urls/**`, `/mock-hotels/**` | Public (no auth) |
| `/api/v1/housekeeping/**` | `HOUSEKEEPING`, `RECEPTIONIST`, `ADMIN` |
| `/api/v1/admin/**` | `ADMIN` only |
| All other endpoints | Any authenticated user |

---

## 9. Distributed Systems Design Components — Detail

### 9.1 Database Sharding & ShardRouter

Hotels, rooms, and bookings are partitioned across three independent MongoDB databases (`hotel_shard_0`, `hotel_shard_1`, `hotel_shard_2`) using `MurmurHash3(hotelId) % numShards`. The `ShardRouter` exposes:
- `getTemplateForHotel(hotelId)` / `getTemplateForBooking(hotelId)` — single-shard writes for transactional correctness.
- `scatterGather(query, class)` — parallel read fan-out across all shards for admin list views.
- `findByIdAcrossShards(id, class)` — sequential fallback search for cross-shard ID lookups.

This design ensures all booking concurrency control (double-booking prevention) happens within a single shard and a single MongoDB transaction, with no distributed 2PC required.

### 9.2 Double-Booking Prevention

`BookingService.createBooking()` acquires a Java `synchronized` lock on a per-room stripe key before querying and writing. The availability check uses the half-open interval `[checkIn, checkOut)` — a room is unavailable if any existing `CONFIRMED` or `CHECKED_IN` booking overlaps. This was verified empirically: 30 concurrent threads targeting the same room produced **exactly 1 confirmation and 29 HTTP 409 Conflict responses**.

### 9.3 Cache-Aside Pattern

`CacheService` wraps Redis with a `ConcurrentHashMap` fallback. Hotel availability and search results are cached on first read and evicted on every write (booking created, checked in/out, or cancelled). The hit ratio in load tests was **93.23%**.

### 9.4 Housekeeping State Machine

Room cleaning follows a strict state machine enforced in `HousekeepingService`:
```
DIRTY → CLEANING → CLEAN → INSPECTION
```
- Check-out automatically creates a `DIRTY` task and sets the room's `housekeepingStatus` to `DIRTY`.
- Advancing to `CLEAN` sets the room's `housekeepingStatus` to `CLEAN` in MongoDB.
- The receptionist's room availability view reads this status to show which rooms are ready for new guests.

---

## 10. Performance Evaluation & Empirical Benchmark Results

```powershell
python load-tests\scripts\load_test_suite.py
```

### Results Summary

| Workload | Concurrent VUs | Total Requests | Throughput (RPS) | Avg Latency (ms) | p95 (ms) | p99 (ms) | Error Rate |
|---|---|---|---|---|---|---|---|
| **Low** | 10 | 4,188 | **417.50** | 11.93 | 28.60 | 44.82 | **0.00%** |
| **Medium** | 50 | 10,785 | **1,073.56** | 27.54 | 48.15 | 87.52 | **0.00%** |
| **High** | 100 | 10,358 | **1,028.43** | 63.88 | 111.48 | 179.91 | **0.00%** |

### Key Benchmark Numbers

| Benchmark | Result |
|---|---|
| Double-booking prevention (30 threads, 1 room) | 1 confirmed, 29 × HTTP 409 — **0 double bookings** |
| Consistent hashing vs. modulo (3 → 4 nodes) | 24.42% vs. 75.02% key movement — **50.60% improvement** |
| Snowflake ID throughput (16 threads, 50k IDs) | **692,581 IDs/sec**, 1.44 µs avg, **0 collisions** |
| Cache hit ratio (medium workload) | **93.23%** |
| Web crawler (3 competitor sites) | 1.065 sec, 2.82 pages/sec |
| Trie autocomplete query latency | **< 0.12 ms** |

---

## 11. Directory Structure

```
hotel-management-system/
├── backend/                              # Spring Boot 3.3.4 Modular Monolith
│   ├── src/main/java/com/hotel/system/
│   │   ├── config/                       # SecurityConfig (JWT + CORS), JwtAuthFilter, JwtService, OpenApiConfig
│   │   ├── controller/                   # 13 REST controllers
│   │   ├── dto/                          # Request/response DTOs (AuthDtos, BookingDtos, BillingDtos, HousekeepingDtos, …)
│   │   ├── exception/                    # GlobalExceptionHandler, BadRequestException, ConflictException, …
│   │   ├── model/                        # MongoDB entities: Hotel, Room, Booking, Guest, Invoice, HousekeepingTask, …
│   │   └── service/                      # Business logic + 8 distributed system components
│   ├── src/test/                         # JUnit 5 concurrency + integration tests (12 tests)
│   └── pom.xml
│
├── frontend/                             # React 18 + Vite SPA (Aurevia Hotels & Resorts)
│   ├── src/
│   │   ├── App.tsx                       # Root router with all routes and layout shells
│   │   ├── brand.ts                      # Centralized brand configuration
│   │   ├── api/client.ts                 # Axios with JWT interceptor
│   │   ├── context/AuthContext.tsx       # Auth state and role-based redirect logic
│   │   ├── types/index.ts                # Shared TypeScript interfaces
│   │   ├── layouts/                      # PublicLayout, ReceptionLayout, HousekeepingLayout, AdminLayout
│   │   ├── components/                   # Reusable UI: SearchForm, GuestSelector, HotelCard, MetricCard, …
│   │   └── pages/                        # 30+ pages across public, admin, and staff portals
│   ├── index.css                         # Tailwind + Aurevia design system (btn-*, card, input-field, badge-*, skeleton)
│   ├── tailwind.config.js                # Brand color tokens, custom shadows, animations
│   ├── vite.config.ts                    # Dev server (port 3000), proxy to backend (port 8088)
│   └── package.json                      # React 18.3, Vite 5.4, TypeScript 5.6, Tailwind 3.4, Axios, Lucide
│
├── docs/
│   ├── architecture/system-architecture.md
│   ├── api-documentation.md
│   ├── component-mapping.md
│   ├── database-design.md
│   ├── performance-report.md
│   └── project-report.md
│
├── experiments/
│   ├── raw-results/                      # Raw JSON from load tests
│   └── processed-results/                # CSV performance summaries
│
├── infrastructure/
│   ├── docker-compose.yml                # App + MongoDB + Redis + Prometheus
│   ├── prometheus/prometheus.yml
│   ├── backend/Dockerfile
│   └── frontend/Dockerfile
│
├── load-tests/
│   └── scripts/load_test_suite.py        # Python automated benchmark suite
│
├── scripts/                              # PowerShell automation
│   ├── start-backend.ps1
│   ├── start-frontend.ps1
│   ├── run-tests.ps1
│   ├── run-benchmarks.ps1
│   ├── seed-data.ps1
│   └── reset-data.ps1
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 12. Troubleshooting & FAQ

**Q: Port 8080 is in use by Oracle Database / TNSLSNR.**  
The backend is pre-configured for port **8088**. If you need a different port, change `server.port` in `backend/src/main/resources/application.yml` and update the `proxy` target in `frontend/vite.config.ts`.

**Q: Redis is not installed or not running.**  
The `CacheService` automatically falls back to an in-memory `ConcurrentHashMap` with TTL eviction. The application runs without Redis — only the distributed cache and rate-limiter telemetry are affected.

**Q: The receptionist or housekeeping portal shows a blank page.**  
Ensure you are logged in with the correct role. `ProtectedRoute` silently redirects wrong-role users to their own portal. Check browser localStorage for `hotel_jwt_token` and `hotel_user` — clearing both and logging in again resolves stale-token issues.

**Q: Where are the MongoDB shard databases?**  
Three independent databases on the local `mongod` instance: `hotel_shard_0`, `hotel_shard_1`, `hotel_shard_2`. View them in MongoDB Compass or via the `/admin/system-design` shard visualizer tab.

**Q: The search form icons overlap the date text.**  
The search form uses icons in label rows rather than absolutely positioned over inputs, so the native date picker UI on all browsers remains unobstructed. If you see overlap in a custom browser theme, the label-row icons are purely decorative and do not affect functionality.

---

## 13. License & Academic Attribution

Developed as an academic demonstration for Advanced Distributed Systems and Software Architecture. Free to use, modify, and extend for educational and research purposes.
