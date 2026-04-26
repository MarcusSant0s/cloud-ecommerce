package com.project.API.user;


import com.project.API.user.dto.AllUsersRequest;
import com.project.API.user.dto.SingleUserRequest;
import com.project.API.user.dto.UpdateUserRequest;
import com.sun.net.httpserver.Authenticator;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController; 
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping
    public ResponseEntity<List<AllUsersRequest>> getAll(){
        return ResponseEntity.ok(userService.GetAllUsers());
    }


    @GetMapping("/me")
    public SingleUserRequest me(@AuthenticationPrincipal User user){
       return SingleUserRequest.from(user);
    }

    @PutMapping
    public ResponseEntity<SingleUserRequest> updateUser(@AuthenticationPrincipal User user,
                                           UpdateUserRequest request){

        return ResponseEntity.ok(userService.updateUser(request, user.getId()));
    }
}
