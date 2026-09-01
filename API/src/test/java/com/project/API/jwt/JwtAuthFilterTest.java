package com.project.API.jwt;

import com.project.API.user.CustomUserDetailsService;
import com.project.API.user.User;
import com.project.API.user.UserFactory;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JwtAuthFilterTest {

    private JwtService jwtService;
    private CustomUserDetailsService userDetailsService;
    private JwtAuthFilter filter;
    private FilterChain chain;

    @BeforeEach
    void setUp() {
        jwtService = Mockito.mock(JwtService.class);
        userDetailsService = Mockito.mock(CustomUserDetailsService.class);
        filter = new JwtAuthFilter(jwtService, userDetailsService);
        chain = Mockito.mock(FilterChain.class);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        // The context is a ThreadLocal; leaving it set bleeds into the next test.
        SecurityContextHolder.clearContext();
    }

    private void doFilter(HttpServletRequest request) throws Exception {
        filter.doFilterInternal(request, new MockHttpServletResponse(), chain);
    }

    @Test
    void shouldStayAnonymousWhenThereIsNoAuthorizationHeader() throws Exception {
        doFilter(new MockHttpServletRequest());

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        // The request still has to reach the chain: the public routes depend on it.
        verify(chain).doFilter(any(), any());
    }

    @Test
    void shouldIgnoreAnAuthorizationHeaderThatIsNotABearerToken() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        doFilter(request);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(jwtService, never()).extractUsername(any());
        verify(chain).doFilter(any(), any());
    }

    @Test
    void shouldAuthenticateOnAValidToken() throws Exception {
        User user = UserFactory.createValidUser();
        when(jwtService.extractUsername("good-token")).thenReturn("marcus@test.com");
        when(userDetailsService.loadUserByUsername("marcus@test.com")).thenReturn(user);
        when(jwtService.isTokenValid("good-token", user)).thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer good-token");
        doFilter(request);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals(user, auth.getPrincipal());
        assertTrue(auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
        verify(chain).doFilter(any(), any());
    }

    @Test
    void shouldNotAuthenticateWhenTheTokenIsRejected() throws Exception {
        User user = UserFactory.createValidUser();
        when(jwtService.extractUsername("expired-token")).thenReturn("marcus@test.com");
        when(userDetailsService.loadUserByUsername("marcus@test.com")).thenReturn(user);
        when(jwtService.isTokenValid("expired-token", user)).thenReturn(false);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer expired-token");
        doFilter(request);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(any(), any());
    }

    @Test
    void shouldSwallowAMalformedTokenAndContinueUnauthenticated() throws Exception {
        when(jwtService.extractUsername("garbage")).thenThrow(new RuntimeException("malformed"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer garbage");
        doFilter(request);

        // The entry point turns this into a 401 later; the filter must not blow up
        // the whole chain with a 500.
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(any(), any());
    }

    @Test
    void shouldGrantTheAdminAuthorityToAnAdminAccount() throws Exception {
        User admin = UserFactory.createAdminUser();
        when(jwtService.extractUsername("admin-token")).thenReturn("admin@test.com");
        when(userDetailsService.loadUserByUsername("admin@test.com")).thenReturn(admin);
        when(jwtService.isTokenValid("admin-token", admin)).thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer admin-token");
        doFilter(request);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertTrue(auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }
}
