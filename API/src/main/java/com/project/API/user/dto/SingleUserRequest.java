package com.project.API.user.dto;


import com.project.API.user.User;
import com.project.API.user.UserAdress;

public record SingleUserRequest(
        Long id,
        String firstName,
        String lastName,
        String email,
        UserAdress userAdress,
        String role
) {

    public static SingleUserRequest from(User user){
        return new SingleUserRequest(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                user.getUserAdress(),
                user.getRole().name()
        );
    }
}
