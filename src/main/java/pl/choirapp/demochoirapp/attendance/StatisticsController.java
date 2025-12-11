package pl.choirapp.demochoirapp.attendance;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.choirapp.demochoirapp.attendance.domain.StatisticsFacade;
import pl.choirapp.demochoirapp.attendance.dto.MemberStatisticsResponse;
import pl.choirapp.demochoirapp.member.domain.MemberFacade;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
class StatisticsController {

    private final StatisticsFacade statisticsFacade;
    private final MemberFacade memberFacade; // Żeby znaleźć ID zalogowanego

    // Dla Zarządu: Lista wszystkich
    @GetMapping
    @PreAuthorize("hasAnyRole('BOARD', 'CONDUCTOR', 'ADMIN')")
    List<MemberStatisticsResponse> getAllStatistics() {
        return statisticsFacade.getAllStatistics();
    }

    // Dla Chórzysty: "Moje statystyki"
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    MemberStatisticsResponse getMyStatistics(Authentication authentication) {
        String email = authentication.getName();
        var member = memberFacade.findByEmail(email); // Pobieramy ID po emailu

        return statisticsFacade.getStatisticsForMember(member.id());
    }
}