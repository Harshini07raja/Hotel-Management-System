package com.hotel.system.service;

import com.hotel.system.dto.AuthDtos;
import com.hotel.system.exception.ResourceNotFoundException;
import com.hotel.system.model.Booking;
import com.hotel.system.model.Guest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class GuestService {

    private final ShardRouter shardRouter;

    public GuestService(ShardRouter shardRouter) {
        this.shardRouter = shardRouter;
    }

    public Guest getGuestById(String guestId) {
        return shardRouter.findByIdAcrossShards(guestId, Guest.class)
                .orElseThrow(() -> new ResourceNotFoundException("Guest with ID " + guestId + " not found."));
    }

    public Guest updateProfile(String guestId, AuthDtos.UserProfileDto request) {
        MongoTemplate template = shardRouter.getTemplateForGuest(guestId);
        Guest guest = template.findById(guestId, Guest.class);
        if (guest == null) {
            throw new ResourceNotFoundException("Guest with ID " + guestId + " not found.");
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            guest.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            guest.setPhone(request.getPhone().trim());
        }
        guest.setUpdatedAt(Instant.now());
        template.save(guest);
        return guest;
    }

    public List<Booking> getGuestBookings(String guestId) {
        Query query = new Query(Criteria.where("guestId").is(guestId))
                .with(Sort.by(Sort.Direction.DESC, "createdAt"));
        return shardRouter.scatterGather(query, Booking.class);
    }
}
