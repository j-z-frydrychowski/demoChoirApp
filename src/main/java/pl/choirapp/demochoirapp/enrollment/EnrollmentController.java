package pl.choirapp.demochoirapp.enrollment;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.choirapp.demochoirapp.enrollment.domain.EnrollmentFacade;
import pl.choirapp.demochoirapp.enrollment.dto.SubmitEnrollmentRequest;
import pl.choirapp.demochoirapp.member.domain.MemberFacade;

import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
class EnrollmentController {

    private final EnrollmentFacade enrollmentFacade;
    private final MemberFacade memberFacade; // Potrzebujemy tego, żeby ustalić KTO się zapisuje

    @PostMapping("/{eventId}/enroll")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()") // Każdy zalogowany może się zapisać (nie tylko Zarząd)
    void submitEnrollment(
            @PathVariable UUID eventId,
            @RequestBody @Valid SubmitEnrollmentRequest request,
            Authentication authentication
    ) {
        // 1. Pobieramy email z tokena
        String email = authentication.getName();

        // 2. Znajdujemy ID użytkownika w bazie
        var member = memberFacade.findByEmail(email);

        // 3. Wysyłamy deklarację
        enrollmentFacade.submitEnrollment(eventId, member.id(), request.status());
    }
}