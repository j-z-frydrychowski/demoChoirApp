package pl.choirapp.demochoirapp.enrollment.dto;

import jakarta.validation.constraints.NotNull;
import pl.choirapp.demochoirapp.enrollment.domain.EnrollmentStatus;

public record SubmitEnrollmentRequest(
        @NotNull(message = "Status decyzji jest wymagany")
        EnrollmentStatus status
) {}