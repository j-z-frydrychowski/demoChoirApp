package pl.choirapp.demochoirapp.event.domain;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;
import pl.choirapp.demochoirapp.event.dto.CreateEventRequest;
import pl.choirapp.demochoirapp.event.dto.EventResponse;
import pl.choirapp.demochoirapp.event.dto.UpdateEventRequest;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
class EventController {

    private final EventFacade eventFacade;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('BOARD', 'CONDUCTOR', 'ADMIN')")
    EventResponse createEvent(@RequestBody @Valid CreateEventRequest request) {
        return eventFacade.createEvent(request);
    }

    @PutMapping("/{id}") // --- NOWOŚĆ: EDYCJA ---
    @PreAuthorize("hasAnyRole('BOARD', 'CONDUCTOR', 'ADMIN')")
    EventResponse updateEvent(@PathVariable UUID id, @RequestBody @Valid UpdateEventRequest request) {
        return eventFacade.updateEvent(id, request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    List<EventResponse> getAllEvents(Authentication authentication) {
        // Sprawdzamy, czy użytkownik ma uprawnienia do widzenia ukrytych (Zarząd/Admin/Dyrygent)
        boolean isPrivileged = authentication.getAuthorities().stream()
                .anyMatch(a ->
                        a.getAuthority().equals("ROLE_ADMIN") ||
                                a.getAuthority().equals("ROLE_BOARD") ||
                                a.getAuthority().equals("ROLE_CONDUCTOR")
                );

        return eventFacade.getAllEvents(isPrivileged);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    EventResponse getEvent(@PathVariable UUID id) {
        return eventFacade.getEventById(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('BOARD', 'ADMIN')")
    void deleteEvent(@PathVariable UUID id) {
        eventFacade.deleteEvent(id);
    }
}