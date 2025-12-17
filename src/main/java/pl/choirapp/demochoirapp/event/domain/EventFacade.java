package pl.choirapp.demochoirapp.event.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.choirapp.demochoirapp.event.dto.CreateEventRequest;
import pl.choirapp.demochoirapp.event.dto.EventResponse;
import pl.choirapp.demochoirapp.event.dto.UpdateEventRequest;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EventFacade {

    private final EventService eventService;

    public EventResponse createEvent(CreateEventRequest request) {
        return eventService.createEvent(request);
    }

    public EventResponse updateEvent(UUID id, UpdateEventRequest request) {
        return eventService.updateEvent(id, request);
    }

    public List<EventResponse> getAllEvents(boolean includeHidden) {
        return eventService.getAllEvents(includeHidden);
    }

    public EventResponse getEventById(UUID id) {
        return eventService.getEventById(id);
    }

    public void deleteEvent(UUID eventId) {
        eventService.deleteEvent(eventId);
    }
}