package pl.choirapp.demochoirapp.infrastructure.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${security.jwt.secret-key}")
    private String secretKey;

    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    // Metoda główna: Generuje token dla konkretnego ID użytkownika
    public String generateToken(UUID userId, String email) {
        return buildToken(Map.of(), userId, email); // Pusta mapa na dodatkowe "claims" (później dodamy tu rolę)
    }

    private String buildToken(Map<String, Object> extraClaims, UUID userId, String email) {
        return Jwts.builder()
                .claims(extraClaims) // Dodatkowe dane (np. rola)
                .subject(userId.toString()) // WAŻNE: W "subject" trzymamy ID użytkownika
                .claim("email", email) // Możemy dodać też email, żeby łatwo go odczytać na froncie
                .issuedAt(new Date(System.currentTimeMillis())) // Data wydania
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration)) // Data ważności
                .signWith(getSignInKey(), Jwts.SIG.HS256) // Podpisujemy naszym tajnym kluczem
                .compact();
    }

    // Pomocnicza metoda do dekodowania klucza z Base64 na obiekt kryptograficzny
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
