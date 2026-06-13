package com.project.API.user;


import com.project.API.user.dto.AllUsersRequest;
import com.project.API.user.dto.SingleUserRequest;
import com.project.API.user.dto.UpdateUserRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize(("hasRole('ADMIN')"))
    @GetMapping
    public ResponseEntity<List<AllUsersRequest>> getAll(){
        return ResponseEntity.ok(userService.GetAllUsers());
    }


    @GetMapping("/me")
    public SingleUserRequest me(@AuthenticationPrincipal User user){
       return SingleUserRequest.from(user);
    }

    @PutMapping("/UpdateMe")
    public ResponseEntity<?> updateUser(@AuthenticationPrincipal User user,
                                           @RequestBody UpdateUserRequest request){


        return ResponseEntity.ok(userService.updateUser(request, user.getId()));
    }
}
