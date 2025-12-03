package pl.choirapp.demochoirapp.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

//    @Bean
//    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(AbstractHttpConfigurer::disable)
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
//                        .requestMatchers("/api/members/**").permitAll()
//                        .anyRequest().authenticated()
//                );
//        return http.build(); // Placeholder for actual security filter chain configuration
//    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Wyłączamy blokadę CSRF (niezbędne dla REST API)
                .csrf(csrf -> csrf.disable())

                // 2. Konfiguracja uprawnień
                .authorizeHttpRequests(auth -> auth
                        // Lista otwartych adresów (BEZ logowania):
                        .requestMatchers(
                                "/v3/api-docs/**",       // <--- Kluczowe: tu są definicje (JSON)
                                "/swagger-ui/**",        // <--- Interfejs graficzny
                                "/swagger-ui.html",      // <--- Strona startowa
                                "/api/members/**"        // <--- Nasze endpointy (rejestracja i login)
                        ).permitAll()

                        // Wszystko inne wymaga logowania
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
