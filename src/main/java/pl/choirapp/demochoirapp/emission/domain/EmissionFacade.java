package pl.choirapp.demochoirapp.emission.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.choirapp.demochoirapp.emission.dto.CreateEmissionSlotRequest;
import pl.choirapp.demochoirapp.emission.dto.EmissionSlotResponse;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EmissionFacade {

    private final EmissionService emissionService;

    // Przekazujemy wywołania do serwisu (Delegacja)

    public EmissionSlotResponse createSlot(CreateEmissionSlotRequest request) {
        return emissionService.createSlot(request);
    }

    public List<EmissionSlotResponse> getAvailableSlots() {
        return emissionService.getAvailableSlots();
    }

    public void bookSlot(UUID slotId, UUID memberId) {
        emissionService.bookSlot(slotId, memberId);
    }

    // Opcjonalnie: Anulowanie
    public void cancelBooking(UUID slotId, UUID memberId) {
        emissionService.cancelBooking(slotId, memberId);
    }
}