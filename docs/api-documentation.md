# Scalable Hotel Management System - API Documentation

## 1. Overview and Base Configuration

This document specifies the RESTful Application Programming Interface (API) for the **Scalable Hotel Management System**. 

- **Base URL**: `http://localhost:8088` (Configured to avoid Windows Oracle Listener conflict on port 8080)
- **API Version**: `v1` (Path prefix: `/api/v1`)
- **Interactive OpenAPI / Swagger UI**: `http://localhost:8088/swagger-ui/index.html`
- **OpenAPI JSON Specification**: `http://localhost:8088/v3/api-docs`
- **Data Format**: `application/json` (UTF-8)

---

## 2. Global Headers and Conventions

| Header | Description | Required | Example |
|---|---|---|---|
| `Content-Type` | Payload encoding | Yes (for POST/PUT) | `application/json` |
| `Authorization` | JWT Bearer token for protected resources | Yes (for protected endpoints) | `Bearer eyJhbGciOi...` |
| `Idempotency-Key` | UUID v4 ensuring at-most-once execution for booking operations | Recommended for POST `/api/v1/bookings` | `9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d` |
| `X-Client-Ip` | Client IP address used by the Token Bucket Rate Limiter | Optional (defaults to remote IP) | `192.168.1.100` |

---

## 3. Standard HTTP Status Codes & Error Envelope

| Status Code | Meaning | Usage Scenario |
|---|---|---|
| `200 OK` | Request succeeded | Standard response for successful GET, PUT, and non-creation POST. |
| `201 Created` | Resource created | Returned by registration, hotel creation, room addition, and reservation booking. |
| `302 Found` | Redirection | Short booking URL resolution to target booking confirmation page. |
| `400 Bad Request` | Validation failure | Malformed payload, invalid date intervals (e.g., checkout before checkin), or negative guest counts. |
| `401 Unauthorized` | Missing / Invalid Token | Expired, forged, or missing JWT Bearer token in the `Authorization` header. |
| `403 Forbidden` | Access Denied | Authenticated user lacks the requisite Role (`GUEST`, `RECEPTIONIST`, `HOUSEKEEPING`, `ADMIN`). |
| `404 Not Found` | Resource not found | Requested entity (Hotel, Room, Booking, Task) does not exist on the targeted database shard. |
| `409 Conflict` | Concurrency / Double-booking | Another concurrent transaction reserved the target room for overlapping date intervals $[checkIn, checkOut)$. |
| `429 Too Many Requests` | Rate limit exceeded | Token bucket exhausted for the calling IP or client identity. |
| `500 Internal Error` | Server error | Unexpected infrastructure fault or shard communication failure. |

### Standard Error Response Envelope
```json
{
  "timestamp": "2026-10-24T17:50:00.123Z",
  "status": 409,
  "error": "Conflict",
  "message": "Room RM-101 is already booked for the selected dates [2026-11-01 to 2026-11-05]",
  "path": "/api/v1/bookings"
}
```

---

## 4. Authentication Endpoints (`/api/v1/auth`)

### 4.1 Register New Account
- **Endpoint**: `POST /api/v1/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Sarah Connor",
  "email": "sarah.connor@example.com",
  "phone": "+1-555-0199",
  "password": "Password123!",
  "role": "GUEST"
}
```
- **Response `201 Created`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": "GST-107536345678901234",
  "name": "Sarah Connor",
  "email": "sarah.connor@example.com",
  "role": "GUEST"
}
```

### 4.2 User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "guest@hotel.com",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": "GST-101",
  "name": "Alice Johnson",
  "email": "guest@hotel.com",
  "role": "GUEST"
}
```

### 4.3 Get Current Authenticated Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Access**: Authenticated (`GUEST`, `RECEPTIONIST`, `HOUSEKEEPING`, `ADMIN`)
- **Response `200 OK`**:
```json
{
  "id": "GST-101",
  "name": "Alice Johnson",
  "email": "guest@hotel.com",
  "phone": "+1-555-0101",
  "role": "GUEST",
  "createdAt": "2026-10-24T12:00:00Z"
}
```

---

## 5. Hotel & Room Management Endpoints (`/api/v1/hotels`)

### 5.1 List Seeded Hotels
- **Endpoint**: `GET /api/v1/hotels`
- **Access**: Public
- **Query Parameters**:
  - `page` (integer, default: 0)
  - `size` (integer, default: 10)
- **Response `200 OK`**:
```json
{
  "hotels": [
    {
      "id": "HTL-101",
      "name": "The Grand Royale Hotel & Spa",
      "city": "New York",
      "address": "742 Fifth Avenue, Manhattan",
      "starRating": 5,
      "basePrice": 250.00,
      "shardId": "hotel_shard_0",
      "amenities": ["WiFi", "Pool", "Spa", "Gym", "Valet Parking", "Restaurant", "Bar"],
      "imageUrl": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "roomCount": 6
    }
  ],
  "totalElements": 8,
  "totalPages": 1,
  "currentPage": 0
}
```

### 5.2 Get Hotel Details with Rooms and Reviews
- **Endpoint**: `GET /api/v1/hotels/{id}`
- **Access**: Public
- **Path Parameter**: `id` (e.g. `HTL-101`)
- **Response `200 OK`**:
```json
{
  "id": "HTL-101",
  "name": "The Grand Royale Hotel & Spa",
  "description": "Iconic luxury property situated in the heart of Manhattan featuring panoramic skyline views.",
  "city": "New York",
  "address": "742 Fifth Avenue, Manhattan",
  "starRating": 5,
  "basePrice": 250.00,
  "shardId": "hotel_shard_0",
  "amenities": ["WiFi", "Pool", "Spa", "Gym", "Valet Parking", "Restaurant", "Bar"],
  "rooms": [
    {
      "id": "RM-101",
      "hotelId": "HTL-101",
      "roomNumber": "101",
      "type": "STANDARD",
      "pricePerNight": 199.99,
      "capacity": 2,
      "amenities": ["King Bed", "City View", "Free WiFi", "Smart TV"],
      "status": "AVAILABLE",
      "housekeepingStatus": "CLEAN"
    }
  ],
  "reviews": [
    {
      "guestName": "David K.",
      "rating": 5,
      "comment": "Exceptional service and impeccable clean rooms.",
      "date": "2026-10-15"
    }
  ]
}
```

### 5.3 Create New Hotel
- **Endpoint**: `POST /api/v1/hotels`
- **Access**: Role `ADMIN`
- **Request Body**:
```json
{
  "name": "Skyline Heights Resort",
  "description": "Boutique hotel with rooftop infinity pool",
  "city": "Chicago",
  "address": "120 N Michigan Ave",
  "starRating": 4,
  "basePrice": 180.00,
  "amenities": ["WiFi", "Pool", "Gym", "Rooftop Lounge"]
}
```
- **Response `201 Created`**: Returns created `Hotel` object routed to calculated shard.

### 5.4 Add Room to Hotel
- **Endpoint**: `POST /api/v1/hotels/{id}/rooms`
- **Access**: Role `ADMIN` or `RECEPTIONIST`
- **Request Body**:
```json
{
  "roomNumber": "405",
  "type": "DELUXE",
  "pricePerNight": 279.00,
  "capacity": 3,
  "amenities": ["Balcony", "Mini-Bar", "King Bed", "Espresso Machine"]
}
```
- **Response `201 Created`**: Returns created `Room` entity.

---

## 6. Search & Autocomplete Endpoints (`/api/v1/search`)

### 6.1 Hotel Search with Multi-Attribute Filtering
- **Endpoint**: `GET /api/v1/search`
- **Access**: Public
- **Query Parameters**:
  - `query` (string, e.g. "Royale" or "Manhattan")
  - `city` (string, e.g. "New York")
  - `minPrice` (double, e.g. 100)
  - `maxPrice` (double, e.g. 400)
  - `capacity` (integer, e.g. 2)
  - `roomType` (string: `STANDARD`, `DELUXE`, `SUITE`, `FAMILY`)
  - `amenities` (comma-separated list, e.g. "Pool,Spa")
  - `sortBy` (string: `price_asc`, `price_desc`, `rating_desc`, `popularity`)
  - `page` (integer, default: 0)
  - `size` (integer, default: 10)
- **Response `200 OK`**: Returns paginated list of matching hotels.

### 6.2 Prefix Trie Autocomplete Suggestions
- **Endpoint**: `GET /api/v1/search/autocomplete`
- **Access**: Public
- **Query Parameters**:
  - `prefix` (string, required, e.g. "san", "new", "lux", "pool")
  - `limit` (integer, default: 8)
- **Response `200 OK`**:
```json
[
  {
    "term": "San Francisco",
    "category": "LOCATION",
    "score": 92
  },
  {
    "term": "Sanctuary Cove Resort",
    "category": "HOTEL_NAME",
    "score": 88
  },
  {
    "term": "Sauna",
    "category": "AMENITY",
    "score": 75
  }
]
```

---

## 7. Availability Checking (`/api/v1/availability`)

### 7.1 Check Real-Time Room Availability
- **Endpoint**: `GET /api/v1/availability`
- **Access**: Public
- **Semantics**: Uses half-open date interval $[checkIn, checkOut)$ evaluated directly against authoritative MongoDB shard.
- **Query Parameters**:
  - `hotelId` (string, required, e.g. "HTL-101")
  - `checkIn` (ISO-8601 Date, required, e.g. "2026-11-01")
  - `checkOut` (ISO-8601 Date, required, e.g. "2026-11-05")
  - `guests` (integer, optional, default: 1)
  - `roomType` (string, optional)
- **Response `200 OK`**:
```json
{
  "hotelId": "HTL-101",
  "checkIn": "2026-11-01",
  "checkOut": "2026-11-05",
  "totalNights": 4,
  "availableRooms": [
    {
      "id": "RM-101",
      "roomNumber": "101",
      "type": "STANDARD",
      "capacity": 2,
      "pricePerNight": 199.99,
      "totalEstimatedPrice": 799.96,
      "amenities": ["King Bed", "City View", "Free WiFi"]
    }
  ]
}
```

---

## 8. Reservation Management (`/api/v1/bookings`)

### 8.1 Create Reservation with Concurrency Protection & Idempotency
- **Endpoint**: `POST /api/v1/bookings`
- **Access**: Authenticated (`GUEST`, `RECEPTIONIST`, `ADMIN`)
- **Headers**:
  - `Idempotency-Key`: UUID string (e.g. `c7b94b00-381a-4c4f-b6e8-ff534571991a`)
- **Request Body**:
```json
{
  "hotelId": "HTL-101",
  "roomId": "RM-101",
  "checkInDate": "2026-11-01",
  "checkOutDate": "2026-11-05",
  "guestsCount": 2,
  "guestName": "Alice Johnson",
  "guestEmail": "guest@hotel.com",
  "specialRequests": "Late check-in requested"
}
```
- **Response `201 Created`**:
```json
{
  "id": "BKG-107536348912345678",
  "hotelId": "HTL-101",
  "hotelName": "The Grand Royale Hotel & Spa",
  "roomId": "RM-101",
  "roomNumber": "101",
  "roomType": "STANDARD",
  "guestId": "GST-101",
  "guestName": "Alice Johnson",
  "guestEmail": "guest@hotel.com",
  "checkInDate": "2026-11-01",
  "checkOutDate": "2026-11-05",
  "guestsCount": 2,
  "totalNights": 4,
  "totalPrice": 799.96,
  "status": "CONFIRMED",
  "shortBookingUrl": "http://localhost:8088/s/aB3x",
  "shortCode": "aB3x",
  "createdAt": "2026-10-24T17:52:10.045Z"
}
```
- **Error Response `409 Conflict` (Double Booking Prevented)**:
```json
{
  "timestamp": "2026-10-24T17:52:10.090Z",
  "status": 409,
  "error": "Conflict",
  "message": "Room RM-101 is already reserved for overlapping dates [2026-11-01 to 2026-11-05]",
  "path": "/api/v1/bookings"
}
```

### 8.2 Get Booking Details
- **Endpoint**: `GET /api/v1/bookings/{id}`
- **Access**: Booking Owner (`GUEST`), `RECEPTIONIST`, or `ADMIN`
- **Response `200 OK`**: Returns populated `BookingDto` with invoice summary.

### 8.3 Get Current Guest's Bookings
- **Endpoint**: `GET /api/v1/bookings/my`
- **Access**: Role `GUEST`
- **Response `200 OK`**: Returns array of `BookingDto` objects sorted by `createdAt` descending.

### 8.4 Cancel Reservation
- **Endpoint**: `POST /api/v1/bookings/{id}/cancel`
- **Access**: Booking Owner or `ADMIN`
- **Response `200 OK`**:
```json
{
  "id": "BKG-107536348912345678",
  "status": "CANCELLED",
  "cancellationFee": 0.00,
  "refundAmount": 799.96,
  "message": "Reservation successfully cancelled and inventory released."
}
```

### 8.5 Simulate Payment
- **Endpoint**: `POST /api/v1/bookings/{id}/payment`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "amount": 799.96,
  "paymentMethod": "CREDIT_CARD",
  "cardLastFour": "4242",
  "transactionReference": "TXN-SIM-998811"
}
```
- **Response `200 OK`**:
```json
{
  "invoiceId": "INV-107536351234567890",
  "bookingId": "BKG-107536348912345678",
  "amountPaid": 799.96,
  "paymentStatus": "PAID",
  "receiptUrl": "http://localhost:8088/api/v1/invoices/INV-107536351234567890",
  "paidAt": "2026-10-24T17:52:45.000Z"
}
```

---

## 9. Check-In & Check-Out Operations (`/api/v1/checkin`, `/api/v1/checkout`)

### 9.1 Guest Check-In
- **Endpoint**: `POST /api/v1/checkin`
- **Access**: Role `RECEPTIONIST` or `ADMIN`
- **Request Body**:
```json
{
  "bookingId": "BKG-107536348912345678",
  "staffNotes": "Keys and welcome package handed over"
}
```
- **Response `200 OK`**:
```json
{
  "bookingId": "BKG-107536348912345678",
  "bookingStatus": "CHECKED_IN",
  "roomStatus": "OCCUPIED",
  "checkInTime": "2026-10-24T17:53:00.120Z",
  "message": "Guest checked in successfully."
}
```

### 9.2 Guest Check-Out & Final Billing
- **Endpoint**: `POST /api/v1/checkout`
- **Access**: Role `RECEPTIONIST` or `ADMIN`
- **Request Body**:
```json
{
  "bookingId": "BKG-107536348912345678",
  "incidentalCharges": 45.00,
  "staffNotes": "Mini-bar charges added, room inspected"
}
```
- **Response `200 OK`**:
```json
{
  "bookingId": "BKG-107536348912345678",
  "bookingStatus": "CHECKED_OUT",
  "roomStatus": "CLEANING",
  "housekeepingTaskId": "HK-107536355678901234",
  "finalBalance": 0.00,
  "checkOutTime": "2026-10-24T17:53:30.450Z",
  "message": "Guest checked out. Housekeeping task dispatched."
}
```

---

## 10. Housekeeping Workflow (`/api/v1/housekeeping`)

### 10.1 List Housekeeping Tasks
- **Endpoint**: `GET /api/v1/housekeeping`
- **Access**: Role `HOUSEKEEPING`, `RECEPTIONIST`, or `ADMIN`
- **Query Parameters**:
  - `hotelId` (optional, string)
  - `status` (optional: `DIRTY`, `CLEANING`, `CLEAN`, `MAINTENANCE`)
- **Response `200 OK`**:
```json
[
  {
    "id": "HK-107536355678901234",
    "hotelId": "HTL-101",
    "roomId": "RM-101",
    "roomNumber": "101",
    "status": "DIRTY",
    "assignedTo": "John Housekeeper",
    "priority": "HIGH",
    "notes": "Post checkout full sanitation required",
    "createdAt": "2026-10-24T17:53:30.450Z"
  }
]
```

### 10.2 Update Housekeeping Task Status
- **Endpoint**: `PUT /api/v1/housekeeping/{taskId}/status`
- **Access**: Role `HOUSEKEEPING` or `ADMIN`
- **Request Body**:
```json
{
  "status": "CLEAN",
  "notes": "Sanitization complete, linen replaced, room inspected."
}
```
- **Response `200 OK`**: Updates task and atomically sets room status to `AVAILABLE`.

---

## 11. Notifications Inbox (`/api/v1/notifications`)

### 11.1 Fetch User Notifications
- **Endpoint**: `GET /api/v1/notifications`
- **Access**: Authenticated
- **Response `200 OK`**:
```json
[
  {
    "id": "NOTIF-107536358912345678",
    "recipientEmail": "guest@hotel.com",
    "title": "Booking Confirmed - The Grand Royale",
    "message": "Your reservation BKG-107536348912345678 for Nov 1 to Nov 5 is confirmed.",
    "type": "BOOKING_CONFIRMATION",
    "read": false,
    "createdAt": "2026-10-24T17:52:10.050Z"
  }
]
```

### 11.2 Mark Notification as Read
- **Endpoint**: `PUT /api/v1/notifications/{id}/read`
- **Access**: Authenticated
- **Response `200 OK`**: Returns updated notification object.

---

## 12. Short URL Service (`/api/v1/short-urls` & `/s/{shortCode}`)

### 12.1 Generate Short URL
- **Endpoint**: `POST /api/v1/short-urls`
- **Access**: Public / Authenticated
- **Request Body**:
```json
{
  "originalUrl": "http://localhost:3000/booking-confirmation/BKG-107536348912345678"
}
```
- **Response `201 Created`**:
```json
{
  "shortCode": "aB3x",
  "shortUrl": "http://localhost:8088/s/aB3x",
  "originalUrl": "http://localhost:3000/booking-confirmation/BKG-107536348912345678",
  "clickCount": 0,
  "createdAt": "2026-10-24T17:52:10.040Z"
}
```

### 12.2 Resolve and Redirect Short URL
- **Endpoint**: `GET /s/{shortCode}`
- **Access**: Public
- **Behavior**: Increments `clickCount` atomically and returns `HTTP 302 Found` with `Location` set to `originalUrl`.

---

## 13. Simulated Web Crawler (`/api/v1/crawler` & `/api/v1/external-hotels`)

### 13.1 Run Web Crawler
- **Endpoint**: `POST /api/v1/crawler/run`
- **Access**: Role `ADMIN`
- **Request Body (Optional target override)**:
```json
{
  "urls": [
    "http://localhost:8088/mock-hotels/grand-azure",
    "http://localhost:8088/mock-hotels/emerald-bay",
    "http://localhost:8088/mock-hotels/solaris-resort"
  ]
}
```
- **Response `200 OK`**:
```json
{
  "status": "COMPLETED",
  "totalCrawled": 3,
  "successCount": 3,
  "failureCount": 0,
  "durationMs": 1065,
  "pagesPerSecond": 2.82
}
```

### 13.2 View Extracted Competitor Intelligence
- **Endpoint**: `GET /api/v1/external-hotels`
- **Access**: Role `ADMIN`
- **Response `200 OK`**:
```json
[
  {
    "id": "EXT-107536369529786368",
    "sourceUrl": "http://localhost:8088/mock-hotels/grand-azure",
    "hotelName": "Grand Azure Palace & Spa",
    "location": "Paris, France",
    "publishedPrice": 295.00,
    "roomCategories": ["Deluxe King Room", "Prestige River View Suite", "Presidential Royal Suite"],
    "amenities": ["Heated Pool", "Luxury Spa", "Michelin Star Dining", "Free High-Speed WiFi"],
    "rating": 4.9,
    "reviewsCount": 1420,
    "crawledAt": "2026-10-24T17:51:08.425Z",
    "status": "SUCCESS"
  }
]
```

---

## 14. Admin & Distributed Telemetry Endpoints (`/api/v1/admin`)

### 14.1 Shard Distribution & Status
- **Endpoint**: `GET /api/v1/admin/shards`
- **Access**: Role `ADMIN`
- **Response `200 OK`**:
```json
[
  {
    "shardId": "hotel_shard_0",
    "uri": "mongodb://localhost:27017/hotel_shard_0",
    "status": "ONLINE",
    "hotelCount": 3,
    "roomCount": 18,
    "bookingCount": 42
  },
  {
    "shardId": "hotel_shard_1",
    "uri": "mongodb://localhost:27017/hotel_shard_1",
    "status": "ONLINE",
    "hotelCount": 3,
    "roomCount": 18,
    "bookingCount": 38
  },
  {
    "shardId": "hotel_shard_2",
    "uri": "mongodb://localhost:27017/hotel_shard_2",
    "status": "ONLINE",
    "hotelCount": 2,
    "roomCount": 12,
    "bookingCount": 25
  }
]
```

### 14.2 Consistent Hashing Ring Visualizer
- **Endpoint**: `GET /api/v1/admin/hash-ring`
- **Access**: Role `ADMIN`
- **Response `200 OK`**:
```json
{
  "totalVirtualNodes": 450,
  "nodes": ["hotel-server-1", "hotel-server-2", "hotel-server-3"],
  "virtualNodesPerNode": 150,
  "ringDistribution": [
    { "server": "hotel-server-1", "virtualNodeCount": 150, "coveragePercent": 33.33 },
    { "server": "hotel-server-2", "virtualNodeCount": 150, "coveragePercent": 33.33 },
    { "server": "hotel-server-3", "virtualNodeCount": 150, "coveragePercent": 33.33 }
  ]
}
```

### 14.3 Hashing Migration Simulation (Modulo vs. Consistent Hashing)
- **Endpoint**: `POST /api/v1/admin/hash-ring/simulate`
- **Access**: Role `ADMIN`
- **Request Body**:
```json
{
  "keyCount": 10000,
  "originalNodes": 3,
  "newNodes": 4
}
```
- **Response `200 OK`**:
```json
{
  "keyCount": 10000,
  "moduloMovedKeys": 7502,
  "moduloMovedPercent": 75.02,
  "consistentHashingMovedKeys": 2442,
  "consistentHashingMovedPercent": 24.42,
  "keysSavedFromMigration": 5060,
  "improvementPercent": 50.60
}
```

### 14.4 Cache Telemetry & Rate Limiter Stats
- **Endpoint**: `GET /api/v1/admin/cache-stats`
- **Response `200 OK`**:
```json
{
  "totalHits": 15420,
  "totalMisses": 1120,
  "hitRatioPercent": 93.23,
  "averageLookupLatencyNanos": 12500,
  "activeCachedKeysCount": 48
}
```
- **Endpoint**: `GET /api/v1/admin/rate-limiter-stats`
- **Response `200 OK`**:
```json
{
  "totalRequestsEvaluated": 25331,
  "totalAllowed": 25150,
  "totalRejected": 181,
  "rejectionRatePercent": 0.71,
  "capacityPerBucket": 100,
  "refillRateTokensPerSecond": 50.0
}
```

---

## 15. Sample PowerShell Invocations

### Health Probe
```powershell
Invoke-RestMethod -Uri "http://localhost:8088/api/v1/hotels" -Method Get
```

### Authenticated Admin Request
```powershell
$auth = Invoke-RestMethod -Uri "http://localhost:8088/api/v1/auth/login" -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"admin@hotel.com","password":"Password123!"}'

$headers = @{ "Authorization" = "Bearer $($auth.token)" }

Invoke-RestMethod -Uri "http://localhost:8088/api/v1/admin/metrics" `
  -Method Get `
  -Headers $headers
```

### Concurrent Booking Test (Idempotent)
```powershell
$headers = @{
  "Authorization"   = "Bearer $($auth.token)"
  "Idempotency-Key" = [System.Guid]::NewGuid().ToString()
  "Content-Type"    = "application/json"
}

$body = @{
  hotelId         = "HTL-101"
  roomId          = "RM-101"
  checkInDate     = "2026-12-01"
  checkOutDate    = "2026-12-05"
  guestsCount     = 2
  guestName       = "Alice Johnson"
  guestEmail      = "guest@hotel.com"
  specialRequests = "High floor"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8088/api/v1/bookings" `
  -Method Post `
  -Headers $headers `
  -Body $body
```
