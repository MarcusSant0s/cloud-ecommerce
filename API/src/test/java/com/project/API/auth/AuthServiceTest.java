package com.project.API.auth;

import com.project.API.auth.dto.AuthResponse;
import com.project.API.auth.dto.CreateUserRequest;
import com.project.API.auth.dto.LoginRequest;
import com.project.API.commom.exception.BadCredentialsException;
import com.project.API.commom.exception.EmailAlreadyRegisteredException;
import com.project.API.jwt.JwtService;
import com.project.API.user.Role;
import com.project.API.user.User;
import com.project.API.user.UserAdressRepository;
import com.project.API.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private UserRepository userRepository;
    private UserAdressRepository adressRepository;
    private JwtService jwtService;
    private BCryptPasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        adressRepository = Mockito.mock(UserAdressRepository.class);
        jwtService = Mockito.mock(JwtService.class);
        // The real encoder: whether the stored password is actually hashed is the
        // point of two of these tests, so it must not be stubbed away.
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, passwordEncoder, jwtService, adressRepository);

        when(jwtService.generateToken(any())).thenReturn("signed-token");
    }

    private CreateUserRequest validRequest() {
        CreateUserRequest request = new CreateUserRequest(
                "Ana", "Silva", "ana@test.com", "secret123",
                "Rua A", "São Paulo", "01000-000", "10");
        request.setBairro("Centro");
        request.setPhone("11999999999");
        return request;
    }

    // ── register ─────────────────────────────────────────────────────────────

    @Test
    void register_shouldRejectAnEmailThatIsAlreadyTaken() {
        when(userRepository.existsByEmail("ana@test.com")).thenReturn(true);

        assertThrows(EmailAlreadyRegisteredException.class,
                () -> authService.register(validRequest()));

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_shouldStoreThePasswordHashedAndNeverInPlainText() {
        when(userRepository.existsByEmail("ana@test.com")).thenReturn(false);

        authService.register(validRequest());

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());

        String stored = saved.getValue().getPassword();
        assertNotEquals("secret123", stored, "password must not be stored in plain text");
        assertTrue(stored.startsWith("$2"), "password should be a bcrypt hash");
        assertTrue(passwordEncoder.matches("secret123", stored));
    }

    @Test
    void register_shouldDefaultANewAccountToTheUserRole() {
        when(userRepository.existsByEmail("ana@test.com")).thenReturn(false);

        authService.register(validRequest());

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());

        // Registration must never be a path to an admin account.
        assertEquals(Role.USER, saved.getValue().getRole());
    }

    @Test
    void register_shouldReturnASignedToken() {
        when(userRepository.existsByEmail("ana@test.com")).thenReturn(false);

        AuthResponse response = authService.register(validRequest());

        assertEquals("signed-token", response.token());
    }

    // ── login ────────────────────────────────────────────────────────────────

    @Test
    void login_shouldReturnATokenForTheCorrectPassword() {
        User user = new User("Ana", "Silva", "ana@test.com", passwordEncoder.encode("secret123"));
        when(userRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(user));

        AuthResponse response = authService.login(new LoginRequest("ana@test.com", "secret123"));

        assertEquals("signed-token", response.token());
    }

    @Test
    void login_shouldRejectAWrongPassword() {
        User user = new User("Ana", "Silva", "ana@test.com", passwordEncoder.encode("secret123"));
        when(userRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(user));

        assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest("ana@test.com", "wrong-password")));

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void login_shouldRejectAnUnknownEmail() {
        when(userRepository.findByEmail("nobody@test.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest("nobody@test.com", "secret123")));
    }

    @Test
    void login_shouldNotRevealWhetherTheEmailExists() {
        User user = new User("Ana", "Silva", "ana@test.com", passwordEncoder.encode("secret123"));
        when(userRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmail("nobody@test.com")).thenReturn(Optional.empty());

        String wrongPassword = assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest("ana@test.com", "wrong"))).getMessage();
        String unknownEmail = assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest("nobody@test.com", "secret123"))).getMessage();

        // Same message either way: a differing one turns login into an account-
        // enumeration oracle.
        assertEquals(wrongPassword, unknownEmail);
    }
}
