package pl.choirapp.demochoirapp.attendance.dto;

import java.util.UUID;

public record MemberStatisticsResponse(
        UUID memberId,
        int attendedEvents,
        int totalEvents,
        double frequencyPercentage
) {}