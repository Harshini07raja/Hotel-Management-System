package com.hotel.system.dto;

import com.hotel.system.model.HousekeepingStatus;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class HousekeepingDtos {

    public static class HousekeepingTaskDto {
        private String id;
        private String hotelId;
        private String roomId;
        private String roomNumber;
        private HousekeepingStatus status;
        private String assignedStaffName;
        private String assignedStaffId;
        private String notes;
        private Instant scheduledAt;
        private Instant completedAt;

        public HousekeepingTaskDto() {}

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

    public static class UpdateTaskStatusRequest {
        @NotNull(message = "Status is required")
        private HousekeepingStatus status;

        private String notes;
        private String assignedStaffName;

        public UpdateTaskStatusRequest() {}

        public HousekeepingStatus getStatus() { return status; }
        public void setStatus(HousekeepingStatus status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getAssignedStaffName() { return assignedStaffName; }
        public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }
    }
}
