package pl.choirapp.demochoirapp.attendance.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.choirapp.demochoirapp.attendance.dto.AttendanceResponse;
import pl.choirapp.demochoirapp.attendance.dto.UpdateAttendanceRequest;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AttendanceFacade {

    private final AttendanceService attendanceService;

    public void updateAttendance(UUID eventId, UpdateAttendanceRequest request) {
        attendanceService.updateAttendance(eventId, request);
    }

    public List<AttendanceResponse> getAttendanceForEvent(UUID eventId) {
        return attendanceService.getAttendanceForEvent(eventId);
    }

    public void deleteAllForEvent(UUID eventId) {
        attendanceService.deleteAttendanceForEvent(eventId);
    }

    public void deleteAllForMember(UUID memberId) {
        attendanceService.deleteAttendanceForMember(memberId);
    }
}