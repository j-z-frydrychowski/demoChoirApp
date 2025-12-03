package pl.choirapp.demochoirapp.member.dto;

import java.util.Set;
import java.util.UUID;

// Prosty rekord przenoszący dane potrzebne do logowania
public record MemberSecurityDto(
        UUID id,
        String email,
        String password,
        Set<String> roles // Role jako Stringi
) {}