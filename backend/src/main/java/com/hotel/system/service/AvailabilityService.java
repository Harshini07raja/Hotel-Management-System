package com.hotel.system.service;

import com.hotel.system.dto.HotelDtos;
import com.hotel.system.model.Booking;
import com.hotel.system.model.BookingStatus;
import com.hotel.system.model.Room;
import com.hotel.system.model.RoomStatus;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Room Inventory & Availability Service.
 * 
 * Critical Design Rules:
 * 1. Half-open booking intervals: a reservation occupies nights [checkInDate, checkOutDate).
 *    Checking out on date D allows another guest to check in on date D!
 *    Two intervals [A_in, A_out) and [B_in, B_out) overlap iff:
 *    A_in < B_out && A_out > B_in
 * 2. Authoritative shard checks: Stale cache is NEVER the sole authority for room availability.
 */
@Service
public class AvailabilityService {

    private final ShardRouter shardRouter;

    public AvailabilityService(ShardRouter shardRouter) {
        this.shardRouter = shardRouter;
    }

    public List<HotelDtos.RoomDto> getAvailableRooms(String hotelId, LocalDate checkInDate, LocalDate checkOutDate, Integer guestCount) {
        if (checkInDate == null || checkOutDate == null || !checkInDate.isBefore(checkOutDate)) {
            throw new IllegalArgumentException("Check-in date must be strictly before check-out date.");
        }

        MongoTemplate template = shardRouter.getTemplateForHotel(hotelId);

        // 1. Fetch all operational rooms for this hotel
        Query roomQuery = new Query(Criteria.where("hotelId").is(hotelId)
                .and("status").ne(RoomStatus.MAINTENANCE));
        if (guestCount != null && guestCount > 0) {
            roomQuery.addCriteria(Criteria.where("capacity").gte(guestCount));
        }
        List<Room> rooms = template.find(roomQuery, Room.class);

        // 2. Fetch active overlapping bookings for this hotel
        // Booking is active if status in (CONFIRMED, CHECKED_IN)
        // Overlap: existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
        Query bookingQuery = new Query(Criteria.where("hotelId").is(hotelId)
                .and("status").in(Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN))
                .and("checkInDate").lt(checkOutDate)
                .and("checkOutDate").gt(checkInDate));

        List<Booking> overlappingBookings = template.find(bookingQuery, Booking.class);
        Set<String> occupiedRoomIds = overlappingBookings.stream()
                .map(Booking::getRoomId)
                .collect(Collectors.toSet());

        // 3. Map to DTOs and mark availability
        List<HotelDtos.RoomDto> dtos = new ArrayList<>();
        for (Room r : rooms) {
            HotelDtos.RoomDto dto = toDto(r);
            boolean isFree = !occupiedRoomIds.contains(r.getId());
            dto.setAvailable(isFree);
            dtos.add(dto);
        }

        return dtos;
    }

    public boolean isRoomAvailable(String hotelId, String roomId, LocalDate checkInDate, LocalDate checkOutDate) {
        MongoTemplate template = shardRouter.getTemplateForHotel(hotelId);

        // Check room status
        Room room = template.findById(roomId, Room.class);
        if (room == null || room.getStatus() == RoomStatus.MAINTENANCE) {
            return false;
        }

        // Half-open overlap query
        Query query = new Query(Criteria.where("roomId").is(roomId)
                .and("status").in(Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN))
                .and("checkInDate").lt(checkOutDate)
                .and("checkOutDate").gt(checkInDate));

        long overlappingCount = template.count(query, Booking.class);
        return overlappingCount == 0;
    }

    public HotelDtos.RoomDto toDto(Room room) {
        HotelDtos.RoomDto dto = new HotelDtos.RoomDto();
        dto.setId(room.getId());
        dto.setHotelId(room.getHotelId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomType(room.getRoomType());
        dto.setCapacity(room.getCapacity());
        dto.setNightlyPrice(room.getNightlyPrice());
        dto.setAmenities(room.getAmenities());
        dto.setStatus(room.getStatus());
        dto.setHousekeepingStatus(room.getHousekeepingStatus());
        return dto;
    }
}
