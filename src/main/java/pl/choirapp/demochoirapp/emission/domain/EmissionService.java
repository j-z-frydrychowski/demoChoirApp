package pl.choirapp.demochoirapp.emission.domain;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.choirapp.demochoirapp.attendance.domain.StatisticsFacade;
import pl.choirapp.demochoirapp.emission.dto.CreateEmissionSlotRequest;
import pl.choirapp.demochoirapp.emission.dto.EmissionSlotResponse;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
class EmissionService {

    private final EmissionSlotRepository emissionSlotRepository;
    private final StatisticsFacade statisticsFacade; // <--- Sprawdzamy frekwencję

    // 1. Zarząd tworzy terminy
    EmissionSlotResponse createSlot(CreateEmissionSlotRequest request) {
        EmissionSlot slot = EmissionSlot.builder()
                .startTime(request.startTime())
                .durationMinutes(request.durationMinutes())
                .memberId(null) // Domyślnie wolny
                .build();
        return mapToResponse(emissionSlotRepository.save(slot));
    }

    // 2. Pobieranie dostępnych terminów
    List<EmissionSlotResponse> getAvailableSlots() {
        return emissionSlotRepository.findAllByMemberIdIsNullOrderByStartTimeAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 3. Rezerwacja (Zapis)
    void bookSlot(UUID slotId, UUID memberId) {
        // A. Sprawdź warunek 50%
        var stats = statisticsFacade.getStatisticsForMember(memberId);
        double frequency = (stats != null) ? stats.frequencyPercentage() : 0.0;

        if (frequency < 50.0) {
            throw new IllegalStateException("Brak uprawnień. Wymagana frekwencja: 50%. Twoja: " + frequency + "%");
        }

        // B. Znajdź slot
        EmissionSlot slot = emissionSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Termin nie istnieje"));

        // C. Sprawdź czy wolny
        if (!slot.isAvailable()) {
            throw new IllegalStateException("Ten termin jest już zajęty.");
        }

        // D. Zapisz
        slot.setMemberId(memberId);
        emissionSlotRepository.save(slot);
    }

    // 4. Anulowanie (opcjonalnie)
    void cancelBooking(UUID slotId, UUID memberId) {
        EmissionSlot slot = emissionSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Termin nie istnieje"));

        if (slot.getMemberId() != null && slot.getMemberId().equals(memberId)) {
            slot.setMemberId(null); // Zwolnij slot
        }
    }

    private EmissionSlotResponse mapToResponse(EmissionSlot slot) {
        return new EmissionSlotResponse(
                slot.getId(),
                slot.getStartTime(),
                slot.getDurationMinutes(),
                slot.isAvailable(),
                slot.getMemberId()
        );
    }

    void releaseSlotsForMember(UUID memberId) {
        List<EmissionSlot> slots = emissionSlotRepository.findAllByMemberIdOrderByStartTimeAsc(memberId);
        for (EmissionSlot slot : slots) {
            slot.setMemberId(null);
        }
        emissionSlotRepository.saveAll(slots);
    }
}