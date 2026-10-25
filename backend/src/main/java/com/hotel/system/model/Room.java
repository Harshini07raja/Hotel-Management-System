package com.hotel.system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "rooms")
@CompoundIndexes({
    @CompoundIndex(name = "hotel_type_status_idx", def = "{'hotelId': 1, 'roomType': 1, 'status': 1}")
})
public class Room {
    @Id
    private String id; // e.g. "RM-101-101"

    private String hotelId;
    private String roomNumber;
    private RoomType roomType;
    private int capacity;
    private BigDecimal nightlyPrice;
    private List<String> amenities = new ArrayList<>();
    private RoomStatus status;
    private HousekeepingStatus housekeepingStatus;

    @Version
    private Long version;

    private Instant updatedAt;

    public Room() {
        this.status = RoomStatus.AVAILABLE;
        this.housekeepingStatus = HousekeepingStatus.CLEAN;
        this.updatedAt = Instant.now();
    }

    public Room(String id, String hotelId, String roomNumber, RoomType roomType,
                int capacity, BigDecimal nightlyPrice, List<String> amenities) {
        this.id = id;
        this.hotelId = hotelId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.capacity = capacity;
        this.nightlyPrice = nightlyPrice;
        this.amenities = amenities != null ? amenities : new ArrayList<>();
        this.status = RoomStatus.AVAILABLE;
        this.housekeepingStatus = HousekeepingStatus.CLEAN;
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getHotelId() { return hotelId; }
    public void setHotelId(String hotelId) { this.hotelId = hotelId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public RoomType getRoomType() { return roomType; }
    public void setRoomType(RoomType roomType) { this.roomType = roomType; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public BigDecimal getNightlyPrice() { return nightlyPrice; }
    public void setNightlyPrice(BigDecimal nightlyPrice) { this.nightlyPrice = nightlyPrice; }

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }

    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }

    public HousekeepingStatus getHousekeepingStatus() { return housekeepingStatus; }
    public void setHousekeepingStatus(HousekeepingStatus housekeepingStatus) { this.housekeepingStatus = housekeepingStatus; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
