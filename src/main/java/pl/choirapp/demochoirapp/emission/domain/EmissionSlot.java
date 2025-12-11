package pl.choirapp.demochoirapp.emission.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "emission_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class EmissionSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private int durationMinutes; // np. 30 lub 45 minut

    // Kto się zapisał? (Jeśli null -> termin wolny)
    // Relacja One-to-One (jeden slot = jeden chórzysta)
    @Column(name = "member_id")
    private UUID memberId;

    // Czy slot jest dostępny? (zajęty = memberId != null)
    public boolean isAvailable() {
        return memberId == null;
    }
}