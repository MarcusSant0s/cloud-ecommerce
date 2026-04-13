package com.project.API.user;

import com.project.API.user.dto.AllUsersRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;


    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AllUsersRequest> GetAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(user -> new AllUsersRequest(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail()
                ))
                .toList();
    }
}


//    public User createUser(String firstName, String lastName, String email, String rawPassword){
//
//        if(userRepository.existsByEmail(email)) {
//            throw new RuntimeException(("Email already in use"));
//        }
//
//        User user = new User();
//        user.setFirstName(firstName);
//        user.setLastName(lastName);
//        user.setEmail(email);
//        user.changePassword(passwordEncoder.encode(rawPassword));
//
//        return userRepository.save(user);
//    }



//    public Optional<SingleUserRequest> loadUserByUsername(String email){
//        return userRepository.findByEmail(email)
//                .orElseThrow(() -> new UserNotFoundException("User Not Found"));
//
//    }



