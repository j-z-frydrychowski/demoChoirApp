package pl.choirapp.demochoirapp.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService; // To wstrzyknie nasz CustomUserDetailsService

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Sprawdzamy czy nagłówek istnieje i zaczyna się od "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Wyciągamy token (ucięcie "Bearer ")
        jwt = authHeader.substring(7);

        // 3. Wyciągamy email z tokena
        userEmail = jwtService.extractEmail(jwt);

        // 4. Jeśli mamy email, a użytkownik nie jest jeszcze zalogowany w kontekście...
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 5. Pobieramy dane użytkownika z bazy
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 6. Walidujemy token
            if (jwtService.isTokenValid(jwt)) {

                // 7. Tworzymy obiekt autoryzacji
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 8. Logujemy użytkownika w systemie (na czas tego żądania)
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 9. Przekazujemy żądanie dalej
        filterChain.doFilter(request, response);
    }
}