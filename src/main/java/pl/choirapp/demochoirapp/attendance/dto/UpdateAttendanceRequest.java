package pl.choirapp.demochoirapp.attendance.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Set;
import java.util.UUID;

public record UpdateAttendanceRequest(
        @NotNull(message = "Lista obecnych nie może być null")
        Set<UUID> presentMemberIds // Set zapewnia brak duplikatów ID
) {}