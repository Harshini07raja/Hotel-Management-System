package com.hotel.system.service;

import com.hotel.system.config.JwtService;
import com.hotel.system.dto.AuthDtos;
import com.hotel.system.exception.BadRequestException;
import com.hotel.system.exception.ConflictException;
import com.hotel.system.exception.ResourceNotFoundException;
import com.hotel.system.model.Guest;
import com.hotel.system.model.NotificationType;
import com.hotel.system.model.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthenticationService {
    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    private final ShardRouter shardRouter;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UniqueIdGeneratorService idGenerator;
    private final NotificationService notificationService;
    private final RateLimiterService rateLimiterService;

    public AuthenticationService(ShardRouter shardRouter,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 UniqueIdGeneratorService idGenerator,
                                 NotificationService notificationService,
                                 RateLimiterService rateLimiterService) {
        this.shardRouter = shardRouter;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.idGenerator = idGenerator;
        this.notificationService = notificationService;
        this.rateLimiterService = rateLimiterService;
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request, String clientIp) {
        // 1. Rate limiter check for registration
        var limitCheck = rateLimiterService.checkLimit(clientIp, "REGISTER");
        if (!limitCheck.isAllowed()) {
            throw new com.hotel.system.exception.RateLimitExceededException(
                    "Registration rate limit exceeded. Please wait.", limitCheck.getRetryAfterSeconds());
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // 2. Prevent duplicate email across shards
        if (findGuestByEmail(normalizedEmail).isPresent()) {
            throw new ConflictException("Email " + normalizedEmail + " is already registered.");
        }

        // 3. Generate Snowflake ID & hash password
        String guestId = idGenerator.nextGuestId();
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.GUEST;
        Guest guest = new Guest(guestId, request.getName().trim(), normalizedEmail, hashedPassword, request.getPhone(), assignedRole);

        // 4. Save to target shard (routed by guestId)
        MongoTemplate template = shardRouter.getTemplateForGuest(guestId);
        template.save(guest);
        log.info("Registered new user [{}: {}] on shard {}", guest.getId(), guest.getEmail(), template.getDb().getName());

        // 5. Send registration notification
        notificationService.createNotification(guestId, NotificationType.REGISTRATION,
                "Welcome to Antigravity Hotels",
                "Hello " + guest.getName() + ", your account has been registered successfully.", null);

        // 6. Generate JWT token
        String token = jwtService.generateToken(guest.getId(), guest.getEmail(), guest.getRole().name());
        return new AuthDtos.AuthResponse(token, guest.getId(), guest.getName(), guest.getEmail(), guest.getRole(), 86400000L);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request, String clientIp) {
        // 1. Rate limiter check for login attempts
        var limitCheck = rateLimiterService.checkLimit(clientIp, "LOGIN");
        if (!limitCheck.isAllowed()) {
            throw new com.hotel.system.exception.RateLimitExceededException(
                    "Too many login attempts. Please wait.", limitCheck.getRetryAfterSeconds());
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        Guest guest = findGuestByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), guest.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }

        String token = jwtService.generateToken(guest.getId(), guest.getEmail(), guest.getRole().name());
        return new AuthDtos.AuthResponse(token, guest.getId(), guest.getName(), guest.getEmail(), guest.getRole(), 86400000L);
    }

    public Optional<Guest> findGuestByEmail(String email) {
        Query query = new Query(Criteria.where("email").is(email));
        List<Guest> found = shardRouter.scatterGather(query, Guest.class);
        return found.isEmpty() ? Optional.empty() : Optional.of(found.get(0));
    }

    public Guest getGuestById(String guestId) {
        return shardRouter.findByIdAcrossShards(guestId, Guest.class)
                .orElseThrow(() -> new ResourceNotFoundException("Guest with ID " + guestId + " not found."));
    }
}
