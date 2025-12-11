package pl.choirapp.demochoirapp.emission.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

interface EmissionSlotRepository extends JpaRepository<EmissionSlot, UUID> {
    // Pobierz wszystkie wolne terminy posortowane chronologicznie
    List<EmissionSlot> findAllByMemberIdIsNullOrderByStartTimeAsc();

    // Pobierz terminy konkretnego użytkownika (Moje rezerwacje)
    List<EmissionSlot> findAllByMemberIdOrderByStartTimeAsc(UUID memberId);
}