package pl.choirapp.demochoirapp.emission.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record EmissionSlotResponse(
        UUID id,
        LocalDateTime startTime,
        int durationMinutes,
        boolean isAvailable, // Czy wolne
        UUID assignedMemberId // ID zapisanego (widoczne tylko dla admina/instruktora)
) {}