package com.hotel.system.service;

import com.hotel.system.dto.HousekeepingDtos;
import com.hotel.system.exception.ResourceNotFoundException;
import com.hotel.system.model.HousekeepingStatus;
import com.hotel.system.model.HousekeepingTask;
import com.hotel.system.model.Room;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Housekeeping Operations Service.
 * Manages cleaning schedules, room hygiene audit trails, and status transitions.
 */
@Service
public class HousekeepingService {
    private static final Logger log = LoggerFactory.getLogger(HousekeepingService.class);

    private final ShardRouter shardRouter;
    private final UniqueIdGeneratorService idGenerator;

    public HousekeepingService(ShardRouter shardRouter, UniqueIdGeneratorService idGenerator) {
        this.shardRouter = shardRouter;
        this.idGenerator = idGenerator;
    }

    public HousekeepingTask createTask(String hotelId, String roomId, String roomNumber, HousekeepingStatus status, String notes) {
        String taskId = "HK-" + idGenerator.nextRawId();
        HousekeepingTask task = new HousekeepingTask(taskId, hotelId, roomId, roomNumber, status, notes);

        MongoTemplate template = shardRouter.getTemplateForHotel(hotelId);
        template.save(task);
        log.info("Created Housekeeping Task [{}] for Room [{}] Status: [{}]", taskId, roomNumber, status);
        return task;
    }

    public List<HousekeepingTask> getTasks(String hotelId, HousekeepingStatus status) {
        Query query = new Query().with(Sort.by(Sort.Direction.DESC, "scheduledAt"));
        if (hotelId != null && !hotelId.trim().isEmpty()) {
            query.addCriteria(Criteria.where("hotelId").is(hotelId));
        }
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        return shardRouter.scatterGather(query, HousekeepingTask.class);
    }

    public HousekeepingTask updateTaskStatus(String taskId, HousekeepingDtos.UpdateTaskStatusRequest request) {
        HousekeepingTask task = shardRouter.findByIdAcrossShards(taskId, HousekeepingTask.class)
                .orElseThrow(() -> new ResourceNotFoundException("Housekeeping task " + taskId + " not found."));

        MongoTemplate template = shardRouter.getTemplateForHotel(task.getHotelId());

        task.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            task.setNotes(request.getNotes());
        }
        if (request.getAssignedStaffName() != null) {
            task.setAssignedStaffName(request.getAssignedStaffName());
        }

        if (request.getStatus() == HousekeepingStatus.CLEAN) {
            task.setCompletedAt(Instant.now());
            // Update Room housekeepingStatus to CLEAN
            Room room = template.findById(task.getRoomId(), Room.class);
            if (room != null) {
                room.setHousekeepingStatus(HousekeepingStatus.CLEAN);
                room.setUpdatedAt(Instant.now());
                template.save(room);
            }
        } else if (request.getStatus() == HousekeepingStatus.CLEANING) {
            Room room = template.findById(task.getRoomId(), Room.class);
            if (room != null) {
                room.setHousekeepingStatus(HousekeepingStatus.CLEANING);
                template.save(room);
            }
        }

        template.save(task);
        log.info("Updated Housekeeping Task [{}] to Status [{}]", taskId, request.getStatus());
        return task;
    }

    public HousekeepingDtos.HousekeepingTaskDto toDto(HousekeepingTask task) {
        HousekeepingDtos.HousekeepingTaskDto dto = new HousekeepingDtos.HousekeepingTaskDto();
        dto.setId(task.getId());
        dto.setHotelId(task.getHotelId());
        dto.setRoomId(task.getRoomId());
        dto.setRoomNumber(task.getRoomNumber());
        dto.setStatus(task.getStatus());
        dto.setAssignedStaffName(task.getAssignedStaffName());
        dto.setAssignedStaffId(task.getAssignedStaffId());
        dto.setNotes(task.getNotes());
        dto.setScheduledAt(task.getScheduledAt());
        dto.setCompletedAt(task.getCompletedAt());
        return dto;
    }
}
