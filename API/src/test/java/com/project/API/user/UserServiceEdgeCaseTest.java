package com.project.API.user;

import com.project.API.cart.CartRepository;
import com.project.API.user.dto.SingleUserRequest;
import com.project.API.user.dto.UpdateUserRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * The seeded admin (see AdminSeeder) is created without a UserAdress, so it is
 * the one account in the system whose address is null. Anything that assumes an
 * address exists breaks for exactly that account.
 */
class UserServiceEdgeCaseTest {

    private UserRepository userRepository;
    private CartRepository cartRepository;
    private UserAdressRepository adressRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        cartRepository = Mockito.mock(CartRepository.class);
        adressRepository = Mockito.mock(UserAdressRepository.class);
        userService = new UserService(userRepository, cartRepository, adressRepository);
    }

    /** Exactly what AdminSeeder builds: no address. */
    private User adminWithoutAddress() {
        User admin = new User("admin", "admin", "admin@local.com", "hashed");
        admin.setRole(Role.ADMIN);
        return admin;
    }

    private UpdateUserRequest fullRequest() {
        return new UpdateUserRequest(
                "Admin", "System", "admin@local.com",
                "Avenida Central", "São Paulo", "01000-000", "999",
                "Centro", "(11) 98888-0000");
    }

    @Test
    @DisplayName("a user with no address can still save their profile")
    void updateUser_shouldWorkForAUserWithoutAnAddress() {
        User admin = adminWithoutAddress();
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        assertDoesNotThrow(() -> userService.updateUser(fullRequest(), 1L));
    }

    @Test
    @DisplayName("saving a profile for an addressless user stores the address that was sent")
    void updateUser_shouldPersistTheSubmittedAddress() {
        User admin = adminWithoutAddress();
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));

        userService.updateUser(fullRequest(), 1L);

        assertNotNull(admin.getUserAdress(), "the submitted address should have been attached");
        assertEquals("Avenida Central", admin.getUserAdress().getStreet());
        assertEquals("01000-000", admin.getUserAdress().getCep());
    }

    @Test
    @DisplayName("GET /users/me tolerates a null address")
    void singleUserRequest_shouldTolerateANullAddress() {
        User admin = adminWithoutAddress();

        SingleUserRequest dto = assertDoesNotThrow(() -> SingleUserRequest.from(admin));

        assertNull(dto.userAdress());
        assertEquals("ADMIN", dto.role());
    }

    @Test
    @DisplayName("updating returns the user, not a serialised ResponseEntity")
    void updateUser_shouldReturnTheUpdatedUserItself() {
        User user = UserFactory.createValidUser();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        SingleUserRequest result = userService.updateUser(fullRequest(), 1L);

        // The controller wrapped the service's ResponseEntity in another one, so the
        // body used to be the inner ResponseEntity's serialised header map.
        assertEquals("Admin", result.firstName());
        assertEquals("Avenida Central", result.userAdress().getStreet());
    }

    @Test
    @DisplayName("an existing address is updated in place, not replaced")
    void updateUser_shouldUpdateAnExistingAddress() {
        User user = UserFactory.createValidUser();
        UserAdress original = user.getUserAdress();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.updateUser(fullRequest(), 1L);

        assertSame(original, user.getUserAdress(), "should reuse the existing row");
        assertEquals("Avenida Central", user.getUserAdress().getStreet());
    }
}
