package com.project.API.user;

import com.project.API.cart.CartRepository;
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
        CartRepository cartRepository = Mockito.mock(CartRepository.class);
        UserAdressRepository adressRepository = Mockito.mock(UserAdressRepository.class);

        User user = UserFactory.createValidUser();
        UpdateUserRequest request = new UpdateUserRequest(
                "Admin",
                "System",
                "admin@test.com",
                "Avenida Central",
                "São Paulo",
                "01000-000",
                "999",
                "Centro",
                "(11) 98888-0000"
        );

        Mockito.when(userRepository.findById(Mockito.any()))
                .thenReturn(Optional.of(user));

        UserService userService = new UserService(userRepository, cartRepository, adressRepository);
        ResponseEntity<Object> result = userService.updateUser(request, 1L);

        Assertions.assertEquals(HttpStatus.ACCEPTED,  result.getStatusCode());
    }

}
