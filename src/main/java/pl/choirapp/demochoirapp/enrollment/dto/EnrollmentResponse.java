package pl.choirapp.demochoirapp.enrollment.dto;

import pl.choirapp.demochoirapp.enrollment.domain.EnrollmentStatus;
import pl.choirapp.demochoirapp.member.domain.VoiceType;

import java.util.UUID;

public record EnrollmentResponse(
        UUID memberId,
        String firstName,
        String lastName,
        VoiceType voiceType,
        EnrollmentStatus status // Może być null, jeśli brak decyzji
) {}