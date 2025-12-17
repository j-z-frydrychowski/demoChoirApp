package pl.choirapp.demochoirapp.member.dto;

import pl.choirapp.demochoirapp.member.domain.MemberRole; // POPRAWKA IMPORTU
import pl.choirapp.demochoirapp.member.domain.MemberStatus;
import pl.choirapp.demochoirapp.member.domain.VoiceType;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

public record MemberResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        VoiceType voiceType,
        Set<MemberRole> roles,
        MemberStatus status,
        String phoneNumber,
        String facebookUrl,
        LocalDate joinedDate,
        boolean isSenior
) {}