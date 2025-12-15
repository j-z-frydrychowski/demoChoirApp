package pl.choirapp.demochoirapp.enrollment.domain;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.choirapp.demochoirapp.enrollment.dto.EnrollmentResponse;
import pl.choirapp.demochoirapp.event.dto.EventResponse;
import pl.choirapp.demochoirapp.event.domain.EventFacade;
import pl.choirapp.demochoirapp.member.domain.MemberFacade;
import pl.choirapp.demochoirapp.member.dto.MemberResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final EventFacade eventFacade;
    private final MemberFacade memberFacade;

    void submitEnrollment(UUID eventId, UUID memberId, EnrollmentStatus status) {
        EventResponse eventDto = eventFacade.getEventById(eventId);

        // 2. Walidacja Deadline'u (Zaktualizowana)
        if (eventDto.enrollmentDeadline() == null) {
            throw new IllegalStateException("To wydarzenie nie obsługuje zapisów (brak deadline'u).");
        }

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

    List<EnrollmentResponse> getEnrollmentsForEvent(UUID eventId) {
        eventFacade.getEventById(eventId); // check exists

        List<MemberResponse> allMembers = memberFacade.getAllMembers();

        Map<UUID, EnrollmentStatus> enrollmentMap = enrollmentRepository.findAllByEventId(eventId).stream()
                .collect(Collectors.toMap(
                        Enrollment::getMemberId,
                        Enrollment::getStatus
                ));

        return allMembers.stream()
                .map(member -> new EnrollmentResponse(
                        member.id(),
                        member.firstName(),
                        member.lastName(),
                        member.voiceType(),
                        enrollmentMap.get(member.id())
                ))
                .toList();
    }

    void deleteEnrollmentsForEvent(UUID eventId) {
        enrollmentRepository.deleteAllByEventId(eventId);
    }

    void deleteEnrollmentsForMember(UUID memberId) {
        enrollmentRepository.deleteAllByMemberId(memberId);
    }
}