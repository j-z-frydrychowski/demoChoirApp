package pl.choirapp.demochoirapp.event.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import pl.choirapp.demochoirapp.event.domain.EventType;

import java.time.LocalDateTime;

public record CreateEventRequest(
        @NotBlank(message = "Nazwa jest wymagana")
        String name,

        @NotNull(message = "Typ wydarzenia jest wymagany")
        EventType type,

        @NotNull(message = "Data rozpoczęcia jest wymagana")
        @FutureOrPresent(message = "Data wydarzenia nie może być w przeszłości") // Przydatna walidacja!
        LocalDateTime startDateTime,

        @NotNull(message = "Deadline zapisów jest wymagany")
        @FutureOrPresent
        LocalDateTime enrollmentDeadline

) {}