package pl.choirapp.demochoirapp.event.dto;

import pl.choirapp.demochoirapp.event.domain.EventType;
import java.time.LocalDateTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String name,
        EventType type,
        LocalDateTime startDateTime,
        LocalDateTime enrollmentDeadline,
        boolean hidden
) {}