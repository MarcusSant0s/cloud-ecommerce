package com.project.API.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest   {
    @NotBlank
    @Email
    String email;

    @NotBlank
    String password;


    public LoginRequest(String email, String password){
        this.email=email;
        this.password=password;
    }

    public String getEmail(){
        return email;
    }

    public String getPassword(){
        return password;
    }
}
