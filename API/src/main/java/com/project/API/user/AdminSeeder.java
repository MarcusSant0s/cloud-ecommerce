package com.project.API.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${email.admin}")
    private String emailAdmin;

    @Value("${email.admin.password}")
    private String emailAdminPassword;


    public AdminSeeder(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    @Override
    public void run(String... args){
        if(userRepository.findByEmail(emailAdmin).isEmpty()){
            User admin = new User(
                    "admin",
                    "admin",
                    emailAdmin,
                    passwordEncoder.encode(emailAdminPassword)
            );
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

    }
}
