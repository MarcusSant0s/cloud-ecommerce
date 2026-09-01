package com.project.API.jwt;

import com.project.API.user.User;
import com.project.API.user.UserFactory;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    // HS256 needs at least 256 bits of key material; a shorter secret makes
    // Keys.hmacShaKeyFor throw rather than silently signing with a weak key.
    private static final String SECRET = "test-secret-key-with-at-least-32-bytes-of-material";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "SECRET_KEY", SECRET);
    }

    @Test
    void generateToken_shouldPutTheUsernameInTheSubject() {
        User user = UserFactory.createValidUser();

        String token = jwtService.generateToken(user);

        // getUsername() is the email — that is what the filter looks the user up by.
        assertEquals("marcus@test.com", jwtService.extractUsername(token));
    }

    @Test
    void isTokenValid_shouldAcceptATokenIssuedForThatUser() {
        User user = UserFactory.createValidUser();

        String token = jwtService.generateToken(user);

        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void isTokenValid_shouldRejectATokenIssuedForADifferentUser() {
        User owner = UserFactory.createValidUser();
        User someoneElse = UserFactory.createAdminUser();

        String token = jwtService.generateToken(owner);

        assertFalse(jwtService.isTokenValid(token, someoneElse));
    }

    @Test
    void generateToken_shouldExpireOneHourOut() {
        User user = UserFactory.createValidUser();

        String token = jwtService.generateToken(user);
        long millisUntilExpiry = jwtService.extractExpiration(token).getTime() - new Date().getTime();

        // One hour, with a second of slack for the time the test itself takes.
        assertTrue(millisUntilExpiry > 1000L * 60 * 59, "token should last nearly an hour");
        assertTrue(millisUntilExpiry <= 1000L * 60 * 60, "token should not outlive an hour");
    }

    @Test
    void extractUsername_shouldRejectATokenSignedWithAnotherKey() {
        User user = UserFactory.createValidUser();

        JwtService otherIssuer = new JwtService();
        ReflectionTestUtils.setField(otherIssuer, "SECRET_KEY",
                "a-completely-different-secret-key-of-sufficient-length");
        String foreignToken = otherIssuer.generateToken(user);

        // A token minted with a key we don't hold must not parse — otherwise anyone
        // could sign their own admin token.
        assertThrows(SignatureException.class, () -> jwtService.extractUsername(foreignToken));
    }

    @Test
    void extractUsername_shouldRejectAStructurallyInvalidToken() {
        assertThrows(RuntimeException.class, () -> jwtService.extractUsername("not.a.jwt"));
    }
}
