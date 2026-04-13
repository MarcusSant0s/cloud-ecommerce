package com.project.API.user.dto;

import com.project.API.user.User;

public record SingleUserRequest(
        Long id,
        String firstName,
        String lastName,
        String email
) {

    public static SingleUserRequest from(User user){
        return new SingleUserRequest(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername()
        );
    }
}
