# Database Design & Sharding Strategy

## 1. Overview
The **Scalable Hotel Management System** utilizes a partitioned MongoDB architecture with an explicit, deterministic shard routing layer (`ShardRouter`). Data is partitioned across multiple independently addressable databases (`hotel_shard_0`, `hotel_shard_1`, `hotel_shard_2`, and dynamically expandable `hotel_shard_3`).

---

## 2. Collections and Schema Specifications

### 2.1 `guests` Collection
- **Shard Key**: `guestId` (Hash-partitioned: `hash(guestId) % numGuestShards`)
- **Fields**:
  - `id`: String (Snowflake ID, e.g. `GST-173829482101`)
  - `name`: String (Full name)
  - `email`: String (Unique index, normalized lowercase)
  - `passwordHash`: String (BCrypt salt & hash)
  - `phone`: String
  - `role`: Enum (`GUEST`, `RECEPTIONIST`, `HOUSEKEEPING`, `ADMIN`)
  - `createdAt`: ISODate
  - `updatedAt`: ISODate
- **Indexes**:
  - `{ "id": 1 }` (Primary unique)
  - `{ "email": 1 }` (Unique across shards via routing check)

### 2.2 `hotels` Collection
- **Shard Key**: `hotelId` (Hash-partitioned: `hash(hotelId) % numHotelShards`)
- **Fields**:
  - `id`: String (e.g. `HTL-101`)
  - `name`: String
  - `city`: String
  - `address`: String
  - `country`: String
  - `description`: String
  - `starRating`: Double (e.g. 4.8)
  - `amenities`: Array[String] (e.g. `["WiFi", "Pool", "Spa", "Gym", "Breakfast", "Parking"]`)
  - `images`: Array[String]
  - `basePrice`: BigDecimal
  - `popularityScore`: Long (for autocomplete ranking)
  - `createdAt`: ISODate
- **Indexes**:
  - `{ "id": 1 }` (Primary unique)
  - `{ "city": 1, "starRating": -1 }` (Compound search)
  - `{ "amenities": 1 }` (Multikey index)

### 2.3 `rooms` Collection
- **Shard Key**: `hotelId` (Co-located with the parent hotel on the same shard!)
- **Fields**:
  - `id`: String (e.g. `RM-101-204`)
  - `hotelId`: String (References `hotels.id`)
  - `roomNumber`: String (e.g. "204")
  - `roomType`: Enum (`STANDARD`, `DELUXE`, `SUITE`, `FAMILY`)
  - `capacity`: Integer (Maximum guests, e.g. 2, 4)
  - `nightlyPrice`: BigDecimal (Authoritative nightly rate)
  - `amenities`: Array[String]
  - `status`: Enum (`AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`)
  - `housekeepingStatus`: Enum (`CLEAN`, `DIRTY`, `CLEANING`, `INSPECTION`)
  - `version`: Long (Optimistic concurrency version)
  - `updatedAt`: ISODate
- **Indexes**:
  - `{ "id": 1 }` (Unique)
  - `{ "hotelId": 1, "roomType": 1, "status": 1 }` (Compound availability index)

### 2.4 `bookings` Collection
- **Shard Key**: `hotelId` (Primary shard key to guarantee single-shard transactional locking of rooms)
- **Fields**:
  - `id`: String (Snowflake ID, e.g. `BK-8934271892`)
  - `idempotencyKey`: String (Unique index per client submission)
  - `hotelId`: String
  - `roomId`: String
  - `roomNumber`: String
  - `guestId`: String
  - `guestName`: String
  - `guestEmail`: String
  - `checkInDate`: LocalDate (ISO `YYYY-MM-DD`, inclusive)
  - `checkOutDate`: LocalDate (ISO `YYYY-MM-DD`, exclusive)
  - `guestCount`: Integer
  - `nightlyRateSnapshot`: BigDecimal (Frozen rate at reservation time)
  - `totalNights`: Integer
  - `totalPrice`: BigDecimal
  - `status`: Enum (`PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`)
  - `shortBookingCode`: String (Unique short code, e.g. `xK9mP2q`)
  - `shortBookingUrl`: String
  - `createdAt`: ISODate
  - `updatedAt`: ISODate
- **Indexes**:
  - `{ "id": 1 }` (Unique)
  - `{ "idempotencyKey": 1 }` (Sparse unique for retry protection)
  - `{ "roomId": 1, "checkInDate": 1, "checkOutDate": 1, "status": 1 }` (Overlap detection index)
  - `{ "guestId": 1, "createdAt": -1 }` (Guest booking history)

### 2.5 `invoices` & `payments` Collection
- **Shard Key**: `hotelId` or `guestId`
- **Fields**:
  - `id`: String (Snowflake ID, e.g. `INV-90231`)
  - `bookingId`: String
  - `guestId`: String
  - `roomCharges`: BigDecimal
  - `taxAmount`: BigDecimal (Configurable 12% / 18%)
  - `serviceCharges`: BigDecimal
  - `discount`: BigDecimal
  - `totalAmount`: BigDecimal
  - `paymentStatus`: Enum (`UNPAID`, `PAID`, `REFUNDED`, `FAILED`)
  - `paymentReference`: String (Simulated transaction ID)
  - `paymentMethod`: String (`SIMULATED_CREDIT_CARD`, `SIMULATED_UPI`, `SIMULATED_WALLET`)
  - `paidAt`: ISODate

### 2.6 `housekeeping_tasks` Collection
- **Fields**:
  - `id`: String (Snowflake ID)
  - `hotelId`: String
  - `roomId`: String
  - `roomNumber`: String
  - `status`: Enum (`DIRTY`, `CLEANING`, `CLEAN`, `MAINTENANCE`)
  - `assignedStaffName`: String
  - `assignedStaffId`: String
  - `notes`: String
  - `scheduledAt`: ISODate
  - `completedAt`: ISODate

### 2.7 `notifications` Collection
- **Fields**:
  - `id`: String (Snowflake ID)
  - `guestId`: String
  - `type`: Enum (`REGISTRATION`, `BOOKING_CONFIRMATION`, `CANCELLATION`, `CHECK_IN`, `CHECK_OUT`, `INVOICE`, `PAYMENT_SUCCESS`, `PAYMENT_FAILURE`)
  - `title`: String
  - `message`: String
  - `bookingId`: String
  - `read`: Boolean
  - `createdAt`: ISODate

### 2.8 `short_urls` Collection
- **Fields**:
  - `shortCode`: String (Primary unique key, e.g. `xK9mP2q`)
  - `bookingId`: String
  - `targetUrl`: String
  - `guestId`: String
  - `clickCount`: Long
  - `createdAt`: ISODate
  - `expiresAt`: ISODate

### 2.9 `external_hotel_data` Collection
- **Fields**:
  - `id`: String
  - `sourceUrl`: String
  - `hotelName`: String
  - `location`: String
  - `publishedPrice`: BigDecimal
  - `roomCategories`: Array[String]
  - `amenities`: Array[String]
  - `rating`: Double
  - `reviewsCount`: Integer
  - `crawledAt`: ISODate
  - `status`: String (`SUCCESS`, `PARTIAL`)

---

## 3. Sharding Architecture & Cross-Shard Handling

```
                         [Client Requests]
                                 │
                                 ▼
                         ┌───────────────┐
                         │  ShardRouter  │
                         └───────┬───────┘
                                 │
             ┌───────────────────┼───────────────────┐
             ▼                   ▼                   ▼
     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
     │ hotel_shard_0│    │ hotel_shard_1│    │ hotel_shard_2│
     │   (Port 27017│    │   (Port 27017│    │   (Port 27017│
     │    /shard_0) │    │    /shard_1) │    │    /shard_2) │
     └──────────────┘    └──────────────┘    └──────────────┘
```

1. **Deterministic Hashing**:
   $ShardID = \text{abs}(\text{MurmurHash3}(Key)) \pmod N$
2. **Co-location Strategy**:
   - Rooms and Bookings are sharded by `hotelId`.
   - Consequently, all rooms for Hotel $H_1$ and all reservations for $H_1$ live on the EXACT SAME SHARD!
   - This eliminates the need for expensive two-phase commit (2PC) distributed transactions during room booking.
3. **Scatter-Gather Cross-Shard Queries**:
   - For citywide hotel search (`GET /api/v1/search/hotels?city=Paris`), the `ShardRouter` concurrently queries all active shards (`hotel_shard_0`, `hotel_shard_1`, `hotel_shard_2`), gathers the results, sorts them by price/rating, and returns a unified paginated response.
