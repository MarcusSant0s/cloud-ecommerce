package com.project.API.auth.dto;

public class LoginRequest   {
    String email;
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
