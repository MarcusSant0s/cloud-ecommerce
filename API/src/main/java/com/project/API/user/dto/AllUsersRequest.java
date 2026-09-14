package com.project.API.user.dto;

import com.project.API.user.User;

import java.time.Instant;

// Record generates Getter/setter
public record AllUsersRequest(
        Long id,
        String firstName,
        String lastName,
        String email,
        String role,
        Instant createdAt
) {

    public static AllUsersRequest from(User user){
        return new AllUsersRequest(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}
