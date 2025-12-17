package pl.choirapp.demochoirapp.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pl.choirapp.demochoirapp.event.domain.EventType;

import java.time.LocalDateTime;

public record UpdateEventRequest(
        @NotBlank String name,
        @NotNull EventType type,
        @NotNull LocalDateTime startDateTime,
        LocalDateTime enrollmentDeadline,
        boolean hidden
) {}