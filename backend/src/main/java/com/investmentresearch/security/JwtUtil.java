package com.investmentresearch.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
@Component
public class JwtUtil {
    @Value("${app.jwt.secret}") private String jwtSecret;
    @Value("${app.jwt.expiration-ms}") private int jwtExpirationMs;
    public String generateToken(Authentication authentication) {
        String username = authentication.getName();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationMs);
        return Jwts.builder().subject(username).issuedAt(new Date()).expiration(expireDate).signWith(key()).compact();
    }
    private Key key() { return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret)); }
    public String getUsernameFromJWT(String token) {
        return Jwts.parser().verifyWith((javax.crypto.SecretKey) key()).build().parseSignedClaims(token).getPayload().getSubject();
    }
    public boolean validateToken(String token) {
        try { Jwts.parser().verifyWith((javax.crypto.SecretKey) key()).build().parseSignedClaims(token); return true; } 
        catch (JwtException | IllegalArgumentException e) { return false; }
    }
}
