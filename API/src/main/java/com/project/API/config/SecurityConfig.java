package com.project.API.config;

import com.project.API.jwt.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter){
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // No cookies or server-side session are used: the bearer token carries the
                // whole authentication, so CSRF has no vector here.
                .csrf(csrf -> csrf.disable())
                // Without this Spring mints an HttpSession per authenticated request even
                // though nothing ever reads it.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(Customizer.withDefaults())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(restAuthenticationEntryPoint())
                        .accessDeniedHandler(restAccessDeniedHandler()))
                .authorizeHttpRequests(auth -> auth
                        // Container/load-balancer probe. Detail is suppressed via
                        // management.endpoint.health.show-details=never.
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()

                        // Only actually routable when springdoc is enabled, which the
                        // prod profile turns off.
                        .requestMatchers("/v3/api-docs", "/v3/api-docs/**",
                                "/swagger-ui.html", "/swagger-ui/**").permitAll()

                            .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/order/webhook").permitAll()
                        .requestMatchers(HttpMethod.GET, "/product").permitAll()
                        .requestMatchers(HttpMethod.GET, "/product/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/category").permitAll()
                        .requestMatchers(HttpMethod.GET, "/category/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/collection").permitAll()
                        .requestMatchers(HttpMethod.GET, "/collection/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/product/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/product/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/product/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/category").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/collection").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/collection/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/collection/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/collection/**").hasRole("ADMIN")

                        // Image management is admin-only: POST /product/{id}/images is already
                        // covered by the /product/** rules above, but /images/** is its own route.
                        .requestMatchers(HttpMethod.PATCH, "/images/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/images/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Missing/invalid token. Spring's default answers 403 here, which reads as
    // "you are logged in but not allowed" and sends the front-end down the wrong
    // branch; a JWT API should say 401 so the client knows to re-authenticate.
    @Bean
    public AuthenticationEntryPoint restAuthenticationEntryPoint() {
        return (request, response, authException) ->
                writeError(response, 401, "UNAUTHENTICATED", "Authentication required");
    }

    // Authenticated, but the role does not allow this endpoint.
    @Bean
    public AccessDeniedHandler restAccessDeniedHandler() {
        return (request, response, accessDeniedException) ->
                writeError(response, 403, "FORBIDDEN", "Access denied");
    }

    // Written by hand rather than through the shared ObjectMapper: this runs inside
    // the security filter chain, which is built before the web ObjectMapper bean
    // exists, and the payload is a fixed four-field ApiError with no user input in it.
    private void writeError(jakarta.servlet.http.HttpServletResponse response,
                            int status, String code, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                "{\"status\":" + status
                        + ",\"code\":\"" + code + "\""
                        + ",\"message\":\"" + message + "\""
                        + ",\"details\":null}");
    }

    @Value("${cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        // Without this the browser re-preflights every mutating request.
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }


    @Bean
    public BCryptPasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
