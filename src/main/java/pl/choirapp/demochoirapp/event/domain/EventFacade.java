package pl.choirapp.demochoirapp.event.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.choirapp.demochoirapp.event.dto.CreateEventRequest;
import pl.choirapp.demochoirapp.event.dto.EventResponse;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EventFacade {

    private final EventService eventService;

    public EventResponse createEvent(CreateEventRequest request) {
        return eventService.createEvent(request);
    }

    public List<EventResponse> getAllEvents() {
        return eventService.getAllEvents();
    }

    public EventResponse getEventById(UUID id) {
        return eventService.getEventById(id);
    }

    public void deleteEvent(UUID eventId) {
        eventService.deleteEvent(eventId);
    }
    // Ta metoda przyda się później dla modułu Attendance!
    // Ponieważ Event jest package-private, nie możemy go zwrócić na zewnątrz pakietu.
    // Ale w przyszłości Attendance będzie w innym pakiecie, więc pomyślimy o tym przy integracji.
    // Na razie wystarczy to co wyżej.
}