package com.project.API.auth;


import com.project.API.auth.dto.CreateUserRequest;
import com.project.API.auth.dto.LoginRequest;
import com.project.API.auth.dto.AuthResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }



        @PostMapping("/register")
    public AuthResponse register(@RequestBody CreateUserRequest request){
        return authService.register(request);
    }


    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
