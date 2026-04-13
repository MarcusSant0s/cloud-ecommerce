package com.project.API.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.function.Function;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private final String SECRET_KEY = "6j2FXooJW8iKSlxhoNsZJxXrICFWM1Dijpp8LceZRGfQ7dFc1z64GgbfyEuHdTX8ClXCAA1jlVZ5J7VvYLu1Snu709y2IsmP86wlIHwwtfMnkttBlCUPjRNfVl0Srv7FBNUr9niBXGcsdVUnK1nCncVPJDGCsW3QIg68wsPcfwcJBDGTURfGnJg8MZYpdExHOKubbKmXLa9gGrHsg1XDqg0vpWXj8baFOHabhmvTTAAvJiUehimHOCa8r4PZPYIl6M8U0KssAB4cDCa0R1wnuQazwuKwCX0PY1XfLEX3j2l6uXPuARrTzBcWG6LVTC8wNXDZbx7bSfK7KQkKyJiz6E2ZwtAPbb2Cc1OzeqnV0LVLuWWIYZqAnXODIC91PTsYWAgFgOFNF5IdAHU16VyKEUW3mE0r30Ug5MvDyTqadWRqScbM5gdS7cnJPxsxk5WvAmx0URcJus9Y65PzxADc6RLjCvSJ79Tp9teJhgeEuQXCxDDDlz";

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        final Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }




    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(
                SECRET_KEY.getBytes(StandardCharsets.UTF_8)
        );
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);     
        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}