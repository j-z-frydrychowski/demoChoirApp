package pl.choirapp.demochoirapp.enrollment.domain;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.choirapp.demochoirapp.event.dto.EventResponse;
import pl.choirapp.demochoirapp.event.domain.EventFacade;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final EventFacade eventFacade; // Potrzebujemy Fasadę, żeby sprawdzić datę deadline'u

    void submitEnrollment(UUID eventId, UUID memberId, EnrollmentStatus status) {
        // 1. Pobierz wydarzenie (tu musimy dodać nową metodę w EventFacade, która zwraca deadline!)
        // Na razie załóżmy, że EventFacade.getEventById zwraca DTO z datą.
        EventResponse eventDto = eventFacade.getEventById(eventId);

        // 2. Walidacja Deadline'u
        if (LocalDateTime.now().isAfter(eventDto.enrollmentDeadline())) {
            throw new IllegalStateException("Termin zapisów na to wydarzenie minął.");
        }

        // 3. Sprawdź, czy już jest wpis (Upsert - Update or Insert)
        Enrollment enrollment = enrollmentRepository.findByEventIdAndMemberId(eventId, memberId)
                .orElse(Enrollment.builder()
                        .eventId(eventId)
                        .memberId(memberId)
                        .build());

        // 4. Aktualizuj decyzję
        enrollment.setStatus(status);
        enrollment.setDecisionDate(LocalDateTime.now());

        enrollmentRepository.save(enrollment);
    }
}