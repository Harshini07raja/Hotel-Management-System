package com.hotel.system.dto;

import com.hotel.system.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}
        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private String phone;
        private Role role = Role.GUEST;

        public RegisterRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }

    public static class AuthResponse {
        private String token;
        private String guestId;
        private String name;
        private String email;
        private Role role;
        private long expiresIn;

        public AuthResponse() {}
        public AuthResponse(String token, String guestId, String name, String email, Role role, long expiresIn) {
            this.token = token;
            this.guestId = guestId;
            this.name = name;
            this.email = email;
            this.role = role;
            this.expiresIn = expiresIn;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public String getGuestId() { return guestId; }
        public void setGuestId(String guestId) { this.guestId = guestId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
    }

    public static class UserProfileDto {
        private String id;
        private String name;
        private String email;
        private String phone;
        private Role role;

        public UserProfileDto() {}
        public UserProfileDto(String id, String name, String email, String phone, Role role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.role = role;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
    }
}
