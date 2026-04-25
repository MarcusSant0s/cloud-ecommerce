package com.project.API.auth;

import com.project.API.auth.dto.CreateUserRequest;
import com.project.API.user.User;
import com.project.API.user.UserAdress;
import com.project.API.user.UserRepository;
import com.project.API.auth.dto.AuthResponse;
import com.project.API.auth.dto.LoginRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.project.API.jwt.JwtService;
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    public AuthService(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    public AuthResponse register(CreateUserRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email já cadastrado");
        }

        UserAdress userAdress = new UserAdress(
                request.getStreet(),
                request.getCity(),
                request.getCep(),
                request.getNumber()
        );

        User user = new User(
         request.getFirstName( ),
        request.getLastName( ),
        request.getEmail( ),
        passwordEncoder.encode(request.getPassword())
        );

        user.setUserAdress(userAdress);

        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }




    public AuthResponse login(LoginRequest request){
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas email"));

        System.out.println(request.getPassword());
        System.out.println(user.getPassword());

        if(!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Credenciais inválidas senha");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }

    public Long getAuthenticatedUserId(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        User user = (User) authentication.getPrincipal();

        return user.getId();
    }
}
