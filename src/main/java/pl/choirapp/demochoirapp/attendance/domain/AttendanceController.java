package pl.choirapp.demochoirapp.attendance;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.choirapp.demochoirapp.attendance.domain.AttendanceFacade;
import pl.choirapp.demochoirapp.attendance.dto.UpdateAttendanceRequest;

import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
class AttendanceController {

    private final AttendanceFacade attendanceFacade;

    @PutMapping("/{eventId}/attendance")
    @ResponseStatus(HttpStatus.NO_CONTENT) // 204: Sukces, nie zwracamy treści (bo to update)
    @PreAuthorize("hasAnyRole('BOARD', 'CONDUCTOR', 'ADMIN')")
    void updateAttendance(
            @PathVariable UUID eventId,
            @RequestBody @Valid UpdateAttendanceRequest request
    ) {
        attendanceFacade.updateAttendance(eventId, request);
    }
}