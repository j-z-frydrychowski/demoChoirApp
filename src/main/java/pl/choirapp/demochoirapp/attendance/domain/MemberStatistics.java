package pl.choirapp.demochoirapp.attendance.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "member_statistics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class MemberStatistics {

    @Id
    private UUID memberId; // ID członka jest kluczem głównym (relacja 1:1)

    private int attendedEventsCount; // Liczba obecności (sztuki)
    private int totalEventsCount;    // Liczba wszystkich wydarzeń (sztuki)

    // To są te ważone wartości
    private double weightedPresenceScore; // Zdobyte punkty (Obecności * wagi)
    private double maxPossibleScore;      // Możliwe punkty (Wszystkie * wagi)

    private double frequencyPercentage;   // Wynik końcowy (np. 87.5)

    private LocalDateTime lastUpdated;    // Kiedy ostatnio przeliczono
}