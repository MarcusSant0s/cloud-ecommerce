package com.project.API.user;


import com.project.API.user.dto.AdminUserDetailResponse;
import com.project.API.user.dto.AllUsersRequest;
import jakarta.validation.Valid;
import com.project.API.user.dto.SingleUserRequest;
import com.project.API.user.dto.UpdateRoleRequest;
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
    public ResponseEntity<List<AllUsersRequest>> getAll(
            @RequestParam(required = false) String email
    ){
        return ResponseEntity.ok(userService.GetAllUsers(email));
    }

    // Ficha completa de um usuário para o painel admin. Declarado depois de
    // /me: o Spring casa o caminho literal primeiro, então /users/me continua
    // caindo no handler abaixo e não aqui.
    @PreAuthorize(("hasRole('ADMIN')"))
    @GetMapping("/{userId}")
    public ResponseEntity<AdminUserDetailResponse> getById(@PathVariable Long userId){
        return ResponseEntity.ok(userService.getUserDetail(userId));
    }

    @PreAuthorize(("hasRole('ADMIN')"))
    @PutMapping("/{userId}/role")
    public ResponseEntity<AllUsersRequest> updateRole(
            @AuthenticationPrincipal User admin,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateRoleRequest request
    ){
        return ResponseEntity.ok(userService.updateUserRole(userId, request.role(), admin.getId()));
    }

    @PreAuthorize(("hasRole('ADMIN')"))
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal User admin,
            @PathVariable Long userId
    ){
        userService.deleteUserAsAdmin(userId, admin.getId());
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/me")
    public SingleUserRequest me(@AuthenticationPrincipal User user){
       return SingleUserRequest.from(user);
    }

    @PutMapping("/UpdateMe")
    public ResponseEntity<SingleUserRequest> updateUser(@AuthenticationPrincipal User user,
                                           @Valid @RequestBody UpdateUserRequest request){


        return ResponseEntity.ok(userService.updateUser(request, user.getId()));
    }

    // Direito de eliminação (LGPD, art. 18, VI)
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(@AuthenticationPrincipal User user){
        userService.deleteMe(user.getId());
        return ResponseEntity.noContent().build();
    }
}
