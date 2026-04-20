package com.project.API.auth.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CreateUserRequest {

    @NotBlank
    public String firstName;
    @NotBlank
    public String lastName;
    @Email
    public String email;
    @NotBlank
    public String password;
    @NotBlank
    private String street;
    @NotBlank
    private String city;
    @NotBlank
    private String cep;
    @NotBlank
    private String numberAdress;

    @Column(nullable = false)
    private String neighborhood;

    public CreateUserRequest(String firstName, String lastName, String email,String password, String street, String city, String cep,String numberAdress){
        this.firstName=firstName;
        this.lastName=lastName;
        this.email=email;
        this.password=password;
        this.street=street;
        this.city=city;
        this.cep=cep;
        this.numberAdress=numberAdress;
    }

    public String getEmail(){
        return email;
    }

    public String getFirstName(){
        return firstName;
    }

    public String getLastName(){
        return lastName;
    }

    public String getPassword(){
        return password;
    }
    public String getStreet() {
        return street;
    }
    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }

    public String getCep() {
        return cep;
    }
    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getNumber() {
        return numberAdress;
    }
    public void setNumber(String number) {
        this.numberAdress = number;
    }

    public String getNeighborhood() {
        return neighborhood;
    }
    public void setNeighborhood(String neighborhood) {
        this.neighborhood = neighborhood;
    }
}
