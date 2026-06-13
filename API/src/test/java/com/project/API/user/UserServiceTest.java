package com.project.API.user;

import com.project.API.user.dto.UpdateUserRequest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

public class UserServiceTest {

    @Test
    void shouldReturnResponseEntityAccepted() {
        UserRepository userRepository = Mockito.mock(UserRepository.class);

        User user = UserFactory.createValidUser();
        UpdateUserRequest request = new UpdateUserRequest(
                "Admin",
                "System",
                "admin@test.com",
                "Avenida Central",
                "São Paulo",
                "01000-000",
                "999"
        );

        Mockito.when(userRepository.findById(Mockito.any()))
                .thenReturn(Optional.of(user));

        UserService userService = new UserService(userRepository);
        ResponseEntity<Object> result = userService.updateUser(request, 1L);

        Assertions.assertEquals(HttpStatus.ACCEPTED,  result.getStatusCode());
    }

}
