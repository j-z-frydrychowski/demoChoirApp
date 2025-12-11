package pl.choirapp.demochoirapp.attendance.dto;

import pl.choirapp.demochoirapp.attendance.domain.AttendanceStatus;
import pl.choirapp.demochoirapp.member.domain.VoiceType;

import java.util.UUID;

public record AttendanceResponse(
        UUID memberId,
        String firstName,
        String lastName,
        VoiceType voiceType,
        AttendanceStatus status // To kluczowe pole: PRESENT/ABSENT/itd.
) {}