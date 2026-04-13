package com.project.API.user.dto;

// Record generates Getter/setter
public record AllUsersRequest(
        Long id,
        String firstName,
        String lastName,
        String email
) {}
