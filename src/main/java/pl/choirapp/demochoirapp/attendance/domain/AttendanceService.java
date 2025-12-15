package pl.choirapp.demochoirapp.attendance.domain;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.choirapp.demochoirapp.attendance.dto.AttendanceResponse;
import pl.choirapp.demochoirapp.attendance.dto.UpdateAttendanceRequest;
import pl.choirapp.demochoirapp.event.domain.EventFacade;
import pl.choirapp.demochoirapp.member.domain.MemberFacade;
import pl.choirapp.demochoirapp.member.dto.MemberResponse;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final MemberFacade memberFacade; // Potrzebujemy listy ludzi
    private final EventFacade eventFacade;   // Potrzebujemy sprawdzić czy wydarzenie istnieje
    private final StatisticsService statisticsService;

    void updateAttendance(UUID eventId, UpdateAttendanceRequest request) {
        // 1. Walidacja: Czy wydarzenie istnieje? (Fasada rzuci wyjątek jeśli nie)
        eventFacade.getEventById(eventId);

        // 2. Reset: Usuwamy starą listę dla tego wydarzenia, żeby nadpisać ją nową
        attendanceRepository.deleteAllByEventId(eventId);

        // 3. Pobieramy wszystkich członków chóru
        // (W przyszłości warto filtrować tylko tych ze statusem ACTIVE)
        List<MemberResponse> allMembers = memberFacade.getAllMembers();

        // 4. Budujemy nową listę obecności
        Set<UUID> presentIds = request.presentMemberIds();

        List<Attendance> attendanceList = allMembers.stream()
                .map(member -> {
                    boolean isPresent = presentIds.contains(member.id());

                    return Attendance.builder()
                            .eventId(eventId)
                            .memberId(member.id())
                            .status(isPresent ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT)
                            .build();
                })
                .collect(Collectors.toList());

        // 5. Zapisujemy wszystko jedną paczką (Batch Insert)
        attendanceRepository.saveAll(attendanceList);

        statisticsService.recalculateAllStatistics();
    }

    List<AttendanceResponse> getAttendanceForEvent(UUID eventId) {
        // 1. Sprawdzamy czy event istnieje
        eventFacade.getEventById(eventId);

        // 2. Pobieramy wszystkich członków
        List<MemberResponse> allMembers = memberFacade.getAllMembers();

        // 3. Pobieramy zapisane obecności i mapujemy je dla szybkiego dostępu (Klucz: memberId, Wartość: Status)
        Map<UUID, AttendanceStatus> attendanceMap = attendanceRepository.findAllByEventId(eventId).stream()
                .collect(Collectors.toMap(
                        Attendance::getMemberId,
                        Attendance::getStatus
                ));

        // 4. Łączymy dane (Left Join: Members + Attendance)
        return allMembers.stream()
                .map(member -> {
                    // Pobierz status z mapy lub ustaw ABSENT, jeśli nie znaleziono
                    AttendanceStatus status = attendanceMap.getOrDefault(member.id(), AttendanceStatus.ABSENT);

                    return new AttendanceResponse(
                            member.id(),
                            member.firstName(),
                            member.lastName(),
                            member.voiceType(),
                            status
                    );
                })
                .toList();
    }

    void deleteAttendanceForEvent(UUID eventId) {
        attendanceRepository.deleteAllByEventId(eventId);
    }
}