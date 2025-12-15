package pl.choirapp.demochoirapp.enrollment.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    // Szukamy, czy ten konkretny użytkownik już się zadeklarował na to wydarzenie
    Optional<Enrollment> findByEventIdAndMemberId(UUID eventId, UUID memberId);

    List<Enrollment> findAllByEventId(UUID eventId);

    void deleteAllByEventId(UUID eventId);

    void deleteAllByMemberId(UUID memberId);
}