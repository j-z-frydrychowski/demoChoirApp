package pl.choirapp.demochoirapp.attendance.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.choirapp.demochoirapp.event.domain.EventFacade;
import pl.choirapp.demochoirapp.event.dto.EventResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final AttendanceRepository attendanceRepository;
    private final EventFacade eventFacade;
    private final MemberStatisticsRepository memberStatisticsRepository;

    private LocalDateTime getSeasonStartDate() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        if (today.getMonthValue() < 9) {
            year--;
        }
        return LocalDateTime.of(year, 9, 1, 0, 0);
    }

    @Transactional
    public void recalculateAllStatistics() {
        LocalDateTime seasonStart = getSeasonStartDate();

        // 1. Pobierz wydarzenia z sezonu
        // POPRAWKA: Przekazujemy 'true', aby pobrać WSZYSTKIE wydarzenia (również ukryte)
        List<EventResponse> events = eventFacade.getAllEvents(true).stream()
                .filter(e -> e.startDateTime().isAfter(seasonStart))
                .toList();

        if (events.isEmpty()) return;

        // 2. Pobierz wszystkie obecności
        List<Attendance> attendances = attendanceRepository.findAll();

        // 3. Grupuj po członkach
        Map<UUID, List<Attendance>> memberAttendanceMap = attendances.stream()
                .collect(Collectors.groupingBy(Attendance::getMemberId));

        // 4. Mapa wag
        Map<UUID, Double> eventWeightMap = events.stream()
                .collect(Collectors.toMap(EventResponse::id, e -> e.type().getWeight()));

        // 5. Liczymy i ZAPISUJEMY
        memberAttendanceMap.forEach((memberId, memberAttendances) -> {
            double earnedPoints = 0.0;
            double possiblePoints = 0.0;
            int attendedCount = 0;
            int totalCount = 0;

            for (Attendance att : memberAttendances) {
                if (!eventWeightMap.containsKey(att.getEventId())) continue;

                double weight = eventWeightMap.get(att.getEventId());

                // EXCUSED nie wliczamy do mianownika (ignorujemy)
                if (att.getStatus() == AttendanceStatus.EXCUSED) {
                    continue;
                }

                possiblePoints += weight;
                totalCount++;

                if (att.getStatus() == AttendanceStatus.PRESENT || att.getStatus() == AttendanceStatus.LATE) {
                    earnedPoints += weight;
                    attendedCount++;
                }
            }

            double frequency = (possiblePoints > 0) ? (earnedPoints / possiblePoints) * 100.0 : 0.0;

            // ZAPIS DO BAZY (Upsert)
            MemberStatistics stats = memberStatisticsRepository.findById(memberId)
                    .orElse(MemberStatistics.builder().memberId(memberId).build());

            stats.setAttendedEventsCount(attendedCount);
            stats.setTotalEventsCount(totalCount);
            stats.setWeightedPresenceScore(earnedPoints);
            stats.setMaxPossibleScore(possiblePoints);
            stats.setFrequencyPercentage(frequency);
            stats.setLastUpdated(LocalDateTime.now());

            memberStatisticsRepository.save(stats);
        });
    }
}