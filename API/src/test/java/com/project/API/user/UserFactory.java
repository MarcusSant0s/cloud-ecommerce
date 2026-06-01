package com.project.API.user;


public class UserFactory {

    public static User createValidUser() {

        UserAdress adress = new UserAdress(
                "Rua das Flores",
                "Taubaté",
                "12000-000",
                "123"
        );

        User user = new User(
                "Marcus",
                "Pereira",
                "marcus@test.com",
                "123456"
        );

        user.setRole(Role.USER);
        user.setUserAdress(adress);

        adress.setUser(user);

        return user;
    }

    public static User createAdminUser() {

        UserAdress adress = new UserAdress(
                "Avenida Central",
                "São Paulo",
                "01000-000",
                "999"
        );

        User user = new User(
                "Admin",
                "System",
                "admin@test.com",
                "admin123"
        );

        user.setRole(Role.ADMIN);
        user.setUserAdress(adress);

        adress.setUser(user);

        return user;
    }
}