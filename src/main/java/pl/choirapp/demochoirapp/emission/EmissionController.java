package pl.choirapp.demochoirapp.emission;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.choirapp.demochoirapp.emission.domain.EmissionFacade; // <--- Używamy Fasady
import pl.choirapp.demochoirapp.emission.dto.CreateEmissionSlotRequest;
import pl.choirapp.demochoirapp.emission.dto.EmissionSlotResponse;
import pl.choirapp.demochoirapp.member.domain.MemberFacade;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/emission")
@RequiredArgsConstructor
class EmissionController {

    private final EmissionFacade emissionFacade; // <--- Wstrzykujemy Fasadę
    private final MemberFacade memberFacade;

    // --- DLA ZARZĄDU ---

    @PostMapping("/slots")
    @PreAuthorize("hasAnyRole('BOARD', 'CONDUCTOR', 'ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    EmissionSlotResponse createSlot(@RequestBody @Valid CreateEmissionSlotRequest request) {
        return emissionFacade.createSlot(request);
    }

    // --- DLA CHÓRZYSTÓW ---

    @GetMapping("/slots")
    @PreAuthorize("isAuthenticated()")
    List<EmissionSlotResponse> getAvailableSlots() {
        return emissionFacade.getAvailableSlots();
    }

    @PostMapping("/slots/{slotId}/book")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void bookSlot(@PathVariable UUID slotId, Authentication authentication) {
        String email = authentication.getName();
        var member = memberFacade.findByEmail(email);

        emissionFacade.bookSlot(slotId, member.id());
    }
}