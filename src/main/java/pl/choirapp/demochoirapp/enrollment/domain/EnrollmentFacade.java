package pl.choirapp.demochoirapp.enrollment.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.choirapp.demochoirapp.enrollment.dto.EnrollmentResponse;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EnrollmentFacade {

    private final EnrollmentService enrollmentService;

    public void submitEnrollment(UUID eventId, UUID memberId, EnrollmentStatus status) {
        enrollmentService.submitEnrollment(eventId, memberId, status);
    }

    public List<EnrollmentResponse> getEnrollmentsForEvent(UUID eventId) {
        return enrollmentService.getEnrollmentsForEvent(eventId);
    }
}