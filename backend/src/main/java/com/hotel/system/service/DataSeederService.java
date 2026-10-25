package com.hotel.system.service;

import com.hotel.system.model.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Realistic Data Seeding Service.
 * Seeds demonstration roles, hotels, rooms, bookings, and initializes the Trie index.
 */
@Service
public class DataSeederService {
    private static final Logger log = LoggerFactory.getLogger(DataSeederService.class);

    private final ShardRouter shardRouter;
    private final PasswordEncoder passwordEncoder;
    private final AutocompleteService autocompleteService;

    public DataSeederService(ShardRouter shardRouter,
                             PasswordEncoder passwordEncoder,
                             AutocompleteService autocompleteService) {
        this.shardRouter = shardRouter;
        this.passwordEncoder = passwordEncoder;
        this.autocompleteService = autocompleteService;
    }

    @PostConstruct
    public void seedInitialDataIfEmpty() {
        try {
            // Check if shard-0 already contains hotels
            MongoTemplate template0 = shardRouter.getShardTemplate("shard-0");
            long hotelCount = template0.getCollection("hotels").countDocuments();

            if (hotelCount == 0) {
                log.info("Database appears unseeded. Starting full demonstration dataset seeding...");
                seedAllData();
            } else {
                log.info("Database already seeded with {} hotels. Rebuilding autocomplete index...", hotelCount);
                autocompleteService.reindex();
            }
        } catch (Exception e) {
            log.warn("Auto-seeding encountered issue (will allow manual seed): {}", e.getMessage());
        }
    }

    public synchronized void seedAllData() {
        // 1. Seed Demonstration Users
        seedUsers();

        // 2. Seed Hotels & Rooms
        seedHotelsAndRooms();

        // 3. Rebuild Autocomplete Trie
        autocompleteService.reindex();
        log.info("Data seeding and Autocomplete indexing completed successfully!");
    }

    private void seedUsers() {
        String encodedPass = passwordEncoder.encode("Password123!");

        List<Guest> demoUsers = Arrays.asList(
                new Guest("GST-DEMO-1", "Alice Guest", "guest@hotel.com", encodedPass, "+1-555-0101", Role.GUEST),
                new Guest("GST-DEMO-2", "Bob Receptionist", "receptionist@hotel.com", encodedPass, "+1-555-0102", Role.RECEPTIONIST),
                new Guest("GST-DEMO-3", "Charlie Housekeeping", "housekeeping@hotel.com", encodedPass, "+1-555-0103", Role.HOUSEKEEPING),
                new Guest("GST-DEMO-4", "Diana Admin", "admin@hotel.com", encodedPass, "+1-555-0104", Role.ADMIN)
        );

        for (Guest g : demoUsers) {
            MongoTemplate template = shardRouter.getTemplateForGuest(g.getId());
            template.save(g);
        }
        log.info("Seeded 4 demonstration role accounts (guest, receptionist, housekeeping, admin).");
    }

    private void seedHotelsAndRooms() {
        List<Hotel> hotels = Arrays.asList(
                new Hotel(
                        "HTL-101", "Grand Azure Resort & Spa", "Paris", "14 Rue de Rivoli", "France",
                        "Luxury 5-star palace overlooking the Seine with world-class wellness spa and Michelin-star dining.",
                        4.9, Arrays.asList("WiFi", "Pool", "Spa", "Fine Dining", "Gym", "Concierge", "Valet Parking"),
                        Arrays.asList("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"),
                        BigDecimal.valueOf(280.00), 980
                ),
                new Hotel(
                        "HTL-102", "Emerald Bay Executive Suites", "New York", "767 5th Ave", "USA",
                        "Contemporary skyscraper suites in the heart of Manhattan with breathtaking panoramic skyline views.",
                        4.8, Arrays.asList("WiFi", "Gym", "Business Center", "Rooftop Bar", "Breakfast", "Meeting Rooms"),
                        Arrays.asList("https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"),
                        BigDecimal.valueOf(350.00), 890
                ),
                new Hotel(
                        "HTL-103", "Solaris Alpine Mountain Retreat", "Zurich", "Bahnhofstrasse 45", "Switzerland",
                        "Idyllic alpine chalet featuring ski-in/ski-out convenience, Finnish cedar saunas, and roaring fireplaces.",
                        4.9, Arrays.asList("WiFi", "Ski Access", "Sauna", "Fireplace", "Breakfast", "Mountain View"),
                        Arrays.asList("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800"),
                        BigDecimal.valueOf(420.00), 950
                ),
                new Hotel(
                        "HTL-104", "Tokyo Imperial Garden Hotel", "Tokyo", "1-1 Chiyoda", "Japan",
                        "Serene sanctuary next to the Imperial Palace blending traditional omotenashi hospitality with modern robotics.",
                        4.7, Arrays.asList("WiFi", "Onsen Hot Spring", "Sushi Bar", "Garden View", "Air Purifier", "Tea Room"),
                        Arrays.asList("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"),
                        BigDecimal.valueOf(210.00), 820
                ),
                new Hotel(
                        "HTL-105", "London Royal Victoria Hotel", "London", "35 Park Lane, Mayfair", "UK",
                        "Quintessential British heritage estate offering traditional afternoon tea and regal Mayfair elegance.",
                        4.6, Arrays.asList("WiFi", "Afternoon Tea", "Concierge", "Bar", "Library", "Historic Building"),
                        Arrays.asList("https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"),
                        BigDecimal.valueOf(260.00), 780
                )
        );

        for (Hotel hotel : hotels) {
            MongoTemplate template = shardRouter.getTemplateForHotel(hotel.getId());
            template.save(hotel);

            // Seed 8-12 diverse rooms per hotel across room types
            seedRoomsForHotel(template, hotel.getId(), hotel.getBasePrice());
        }
        log.info("Seeded 5 premier hotels and room inventories across shards.");
    }

    private void seedRoomsForHotel(MongoTemplate template, String hotelId, BigDecimal basePrice) {
        RoomType[] types = RoomType.values();
        int[] capacities = {2, 2, 4, 6};
        double[] priceMultipliers = {1.0, 1.35, 2.1, 2.5};

        for (int floor = 1; floor <= 4; floor++) {
            for (int roomNum = 1; roomNum <= 3; roomNum++) {
                int typeIndex = (floor - 1) % types.length;
                String roomNumber = String.format("%d%02d", floor, roomNum);
                String roomId = String.format("RM-%s-%s", hotelId.replace("HTL-", ""), roomNumber);

                BigDecimal nightlyRate = basePrice.multiply(BigDecimal.valueOf(priceMultipliers[typeIndex]));

                List<String> amenities = Arrays.asList("Smart TV", "King Bed", "High-speed WiFi", "Minibar", "Climate Control");

                Room room = new Room(roomId, hotelId, roomNumber, types[typeIndex], capacities[typeIndex], nightlyRate, amenities);
                template.save(room);
            }
        }
    }

    public synchronized void resetAllData() {
        for (MongoTemplate template : shardRouter.getAllShardTemplates()) {
            template.getCollection("guests").drop();
            template.getCollection("hotels").drop();
            template.getCollection("rooms").drop();
            template.getCollection("bookings").drop();
            template.getCollection("invoices").drop();
            template.getCollection("housekeeping_tasks").drop();
            template.getCollection("notifications").drop();
            template.getCollection("short_urls").drop();
            template.getCollection("external_hotel_data").drop();
        }
        log.info("Dropped collections across all shards.");
        seedAllData();
    }
}
