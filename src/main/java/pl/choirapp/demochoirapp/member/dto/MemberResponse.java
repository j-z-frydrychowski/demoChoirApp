package pl.choirapp.demochoirapp.member.dto;

import pl.choirapp.demochoirapp.member.domain.MemberRole;
import pl.choirapp.demochoirapp.member.domain.VoiceType;

import java.util.Set;
import java.util.UUID;

public record MemberResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        VoiceType voiceType,
        Set<MemberRole> roles
) {}