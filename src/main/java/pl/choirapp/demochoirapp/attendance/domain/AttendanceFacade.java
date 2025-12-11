package pl.choirapp.demochoirapp.attendance.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.choirapp.demochoirapp.attendance.dto.UpdateAttendanceRequest;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AttendanceFacade {

    private final AttendanceService attendanceService;

    public void updateAttendance(UUID eventId, UpdateAttendanceRequest request) {
        attendanceService.updateAttendance(eventId, request);
    }
}