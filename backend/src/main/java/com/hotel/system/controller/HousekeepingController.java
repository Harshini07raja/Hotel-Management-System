package com.hotel.system.controller;

import com.hotel.system.dto.HousekeepingDtos;
import com.hotel.system.model.HousekeepingStatus;
import com.hotel.system.model.HousekeepingTask;
import com.hotel.system.service.HousekeepingService;
import com.hotel.system.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/housekeeping")
@Tag(name = "Housekeeping", description = "Room cleaning task tracking, staff assignment, and hygiene status transitions")
public class HousekeepingController {

    private final HousekeepingService housekeepingService;
    private final MetricsService metricsService;

    public HousekeepingController(HousekeepingService housekeepingService, MetricsService metricsService) {
        this.housekeepingService = housekeepingService;
        this.metricsService = metricsService;
    }

    @GetMapping("/tasks")
    @Operation(summary = "List housekeeping tasks with optional filters")
    public ResponseEntity<List<HousekeepingDtos.HousekeepingTaskDto>> getTasks(
            @RequestParam(required = false) String hotelId,
            @RequestParam(required = false) HousekeepingStatus status) {

        long start = System.currentTimeMillis();
        List<HousekeepingTask> tasks = housekeepingService.getTasks(hotelId, status);
        List<HousekeepingDtos.HousekeepingTaskDto> dtos = tasks.stream()
                .map(housekeepingService::toDto)
                .collect(Collectors.toList());
        metricsService.recordRequest("/api/v1/housekeeping/tasks", System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/tasks")
    @Operation(summary = "Create a new housekeeping cleaning task")
    public ResponseEntity<HousekeepingDtos.HousekeepingTaskDto> createTask(
            @RequestParam String hotelId,
            @RequestParam String roomId,
            @RequestParam String roomNumber,
            @RequestParam(required = false, defaultValue = "DIRTY") HousekeepingStatus status,
            @RequestParam(required = false, defaultValue = "Manual housekeeping request") String notes) {

        HousekeepingTask task = housekeepingService.createTask(hotelId, roomId, roomNumber, status, notes);
        return ResponseEntity.ok(housekeepingService.toDto(task));
    }

    @PatchMapping("/tasks/{taskId}")
    @Operation(summary = "Update cleaning task status (DIRTY -> CLEANING -> CLEAN)")
    public ResponseEntity<HousekeepingDtos.HousekeepingTaskDto> updateTask(
            @PathVariable String taskId,
            @Valid @RequestBody HousekeepingDtos.UpdateTaskStatusRequest request) {

        long start = System.currentTimeMillis();
        HousekeepingTask updated = housekeepingService.updateTaskStatus(taskId, request);
        metricsService.recordRequest("/api/v1/housekeeping/tasks/" + taskId, System.currentTimeMillis() - start, true);
        return ResponseEntity.ok(housekeepingService.toDto(updated));
    }
}
