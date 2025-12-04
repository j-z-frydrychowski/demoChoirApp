package pl.choirapp.demochoirapp.event.domain;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pl.choirapp.demochoirapp.event.domain.EventFacade;
import pl.choirapp.demochoirapp.event.dto.CreateEventRequest;
import pl.choirapp.demochoirapp.event.dto.EventResponse;

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

    @GetMapping
    @PreAuthorize("isAuthenticated()") // Każdy zalogowany może widzieć kalendarz
    List<EventResponse> getAllEvents() {
        return eventFacade.getAllEvents();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    EventResponse getEvent(@PathVariable UUID id) {
        return eventFacade.getEventById(id);
    }
}