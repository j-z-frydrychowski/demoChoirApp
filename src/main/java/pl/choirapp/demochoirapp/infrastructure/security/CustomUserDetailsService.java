package pl.choirapp.demochoirapp.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pl.choirapp.demochoirapp.member.domain.MemberFacade;
import pl.choirapp.demochoirapp.member.dto.MemberSecurityDto;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberFacade memberFacade;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Pobieramy dane przez Fasadę
        MemberSecurityDto member = memberFacade.findByEmail(email);

        // Zamieniamy na obiekt Spring Security User
        return User.builder()
                .username(member.email())
                .password(member.password())
                .authorities(member.roles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role)) // Konwencja: ROLE_NAZWA
                        .collect(Collectors.toList()))
                .build();
    }
}