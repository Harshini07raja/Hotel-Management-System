package com.hotel.system.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "housekeeping_tasks")
public class HousekeepingTask {
    @Id
    private String id; // Snowflake ID

    private String hotelId;
    private String roomId;
    private String roomNumber;
    private HousekeepingStatus status;
    private String assignedStaffName;
    private String assignedStaffId;
    private String notes;
    private Instant scheduledAt;
    private Instant completedAt;

    public HousekeepingTask() {
        this.status = HousekeepingStatus.DIRTY;
        this.scheduledAt = Instant.now();
    }

    public HousekeepingTask(String id, String hotelId, String roomId, String roomNumber,
                            HousekeepingStatus status, String notes) {
        this.id = id;
        this.hotelId = hotelId;
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.status = status;
        this.notes = notes;
        this.scheduledAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getHotelId() { return hotelId; }
    public void setHotelId(String hotelId) { this.hotelId = hotelId; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public HousekeepingStatus getStatus() { return status; }
    public void setStatus(HousekeepingStatus status) { this.status = status; }

    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }

    public String getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(String assignedStaffId) { this.assignedStaffId = assignedStaffId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
