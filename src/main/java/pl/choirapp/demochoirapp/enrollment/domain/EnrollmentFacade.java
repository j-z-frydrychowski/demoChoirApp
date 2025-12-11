package pl.choirapp.demochoirapp.enrollment.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EnrollmentFacade {

    private final EnrollmentService enrollmentService;

    public void submitEnrollment(UUID eventId, UUID memberId, EnrollmentStatus status) {
        enrollmentService.submitEnrollment(eventId, memberId, status);
    }
}