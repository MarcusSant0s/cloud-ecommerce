package com.project.API.user.dto;


import com.project.API.user.User;
import com.project.API.user.UserAdress;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
        @NotBlank
        String firstName,
        @NotBlank
        String lastName,
        @Email
        String email,
        @NotBlank
        String street,
        @NotBlank
        String city,
        @NotBlank
        String cep,
        @NotBlank
        String numberAddress
     ) {

    public User applyTo(User user){
        if(this.firstName != null) user.setFirstName(firstName);
        if(this.lastName != null) user.setLastName(lastName);
        if(this.email != null) user.setEmail(email);


        UserAdress adress = user.getUserAdress();

        if(this.street != null) adress.setStreet(street);
        if(this.city != null) adress.setCity(city);
        if(this.cep != null) adress.setCep(cep);
        if(this.numberAddress != null) adress.setNumber(numberAddress);

        user.setUserAdress(adress);

        return user;

    }
}
