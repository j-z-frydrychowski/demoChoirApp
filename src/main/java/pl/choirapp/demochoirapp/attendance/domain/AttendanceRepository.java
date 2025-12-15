package pl.choirapp.demochoirapp.attendance.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.choirapp.demochoirapp.attendance.domain.Attendance;
import java.util.List;
import java.util.UUID;

// Interface jest package-private (brak public), bo używamy go tylko wewnątrz pakietu domain
interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    // Potrzebne do resetowania listy obecności przed zapisaniem nowej
    void deleteAllByEventId(UUID eventId);

    // Potrzebne, żeby pobrać obecności (przydatne w kolejnym kroku)
    List<Attendance> findAllByEventId(UUID eventId);

    void deleteAllByMemberId(UUID memberId);
}