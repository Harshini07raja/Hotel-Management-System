package com.hotel.system.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mock-hotels")
public class MockHotelSiteController {

    @GetMapping(value = "/grand-azure", produces = MediaType.TEXT_HTML_VALUE)
    public String getGrandAzureHtml() {
        return """
            <!DOCTYPE html>
            <html>
            <head><title>Grand Azure Resort - Official Website</title></head>
            <body>
                <h1 class="hotel-name">Grand Azure Palace & Spa</h1>
                <p class="hotel-location">Paris, France</p>
                <div class="pricing">
                    <span class="price-label">Nightly Rate from:</span>
                    <span class="published-price">$295.00</span>
                </div>
                <div class="ratings">
                    <span class="hotel-rating">4.9</span>
                    <span class="review-count">1420 reviews</span>
                </div>
                <div class="amenities">
                    <span class="amenity-tag">Heated Pool</span>
                    <span class="amenity-tag">Luxury Spa</span>
                    <span class="amenity-tag">Michelin Star Dining</span>
                    <span class="amenity-tag">Free High-Speed WiFi</span>
                    <span class="amenity-tag">Valet Parking</span>
                </div>
                <div class="rooms">
                    <div class="room-category">Deluxe King Room</div>
                    <div class="room-category">Prestige River View Suite</div>
                    <div class="room-category">Presidential Royal Suite</div>
                </div>
            </body>
            </html>
            """;
    }

    @GetMapping(value = "/emerald-bay", produces = MediaType.TEXT_HTML_VALUE)
    public String getEmeraldBayHtml() {
        return """
            <!DOCTYPE html>
            <html>
            <head><title>Emerald Bay Suites - Manhattan</title></head>
            <body>
                <h1 class="hotel-name">Emerald Bay Executive Tower</h1>
                <p class="hotel-location">New York, USA</p>
                <div class="pricing">
                    <span class="published-price">$380.00</span>
                </div>
                <div class="ratings">
                    <span class="hotel-rating">4.8</span>
                    <span class="review-count">980 reviews</span>
                </div>
                <div class="amenities">
                    <span class="amenity-tag">24/7 Fitness Center</span>
                    <span class="amenity-tag">Rooftop Lounge</span>
                    <span class="amenity-tag">Business Center</span>
                    <span class="amenity-tag">Complimentary Breakfast</span>
                </div>
                <div class="rooms">
                    <div class="room-category">Studio Executive Suite</div>
                    <div class="room-category">Penthouse Panoramic Suite</div>
                </div>
            </body>
            </html>
            """;
    }

    @GetMapping(value = "/solaris-resort", produces = MediaType.TEXT_HTML_VALUE)
    public String getSolarisHtml() {
        return """
            <!DOCTYPE html>
            <html>
            <head><title>Solaris Mountain Chalet - Zurich Alps</title></head>
            <body>
                <h1 class="hotel-name">Solaris Alpine Mountain Retreat</h1>
                <p class="hotel-location">Zurich, Switzerland</p>
                <div class="pricing">
                    <span class="published-price">$440.00</span>
                </div>
                <div class="ratings">
                    <span class="hotel-rating">4.95</span>
                    <span class="review-count">650 reviews</span>
                </div>
                <div class="amenities">
                    <span class="amenity-tag">Ski-in / Ski-out</span>
                    <span class="amenity-tag">Finnish Sauna</span>
                    <span class="amenity-tag">Stone Fireplace</span>
                    <span class="amenity-tag">Alps Panorama</span>
                </div>
                <div class="rooms">
                    <div class="room-category">Cedar Alpine Chalet</div>
                    <div class="room-category">Glacier View Family Suite</div>
                </div>
            </body>
            </html>
            """;
    }
}
