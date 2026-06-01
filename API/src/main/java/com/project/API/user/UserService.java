package com.project.API.user;

import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.user.dto.AllUsersRequest;
import com.project.API.user.dto.SingleUserRequest;
import com.project.API.user.dto.UpdateUserRequest;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.util.List;

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


    @Transactional
    public SingleUserRequest updateUser(
                            UpdateUserRequest request,
                            Long userId
    ){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        request.applyTo(user);

        return SingleUserRequest.from(user);
    }
}





