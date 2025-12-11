package pl.choirapp.demochoirapp.emission.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CreateEmissionSlotRequest(
        @NotNull @Future LocalDateTime startTime,
        @NotNull int durationMinutes
) {}