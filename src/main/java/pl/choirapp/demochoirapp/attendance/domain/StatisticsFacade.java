package pl.choirapp.demochoirapp.attendance.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.choirapp.demochoirapp.attendance.dto.MemberStatisticsResponse;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StatisticsFacade {

    private final MemberStatisticsRepository memberStatisticsRepository;

    // Metoda dla Zarządu (wszyscy)
    public List<MemberStatisticsResponse> getAllStatistics() {
        return memberStatisticsRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Metoda dla Chórzysty (tylko ja)
    public MemberStatisticsResponse getStatisticsForMember(UUID memberId) {
        return memberStatisticsRepository.findById(memberId)
                .map(this::mapToResponse)
                .orElse(null); // Lub rzuć wyjątek, albo zwróć pusty obiekt 0%
    }

    private MemberStatisticsResponse mapToResponse(MemberStatistics stats) {
        return new MemberStatisticsResponse(
                stats.getMemberId(),
                stats.getAttendedEventsCount(),
                stats.getTotalEventsCount(),
                stats.getFrequencyPercentage()
        );
    }

    public void deleteAllForEvent(UUID eventId) {
        attendanceService.deleteAttendanceForEvent(eventId);
    }
}