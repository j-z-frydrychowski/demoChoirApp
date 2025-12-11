package pl.choirapp.demochoirapp.event.domain;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.choirapp.demochoirapp.event.dto.CreateEventRequest;
import pl.choirapp.demochoirapp.event.dto.EventResponse;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
class EventService {

    private final EventRepository eventRepository;

    EventResponse createEvent(CreateEventRequest request) {
        Event event = Event.builder()
                .name(request.name())
                .type(request.type())
                .startDateTime(request.startDateTime())
                .enrollmentDeadline(request.enrollmentDeadline())
                .build();

        return mapToResponse(eventRepository.save(event));
    }

    List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByStartDateTimeDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    EventResponse getEventById(UUID id) {
        return eventRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id)); // Warto zrobić własny wyjątek EventNotFoundException
    }

    // Metoda pomocnicza dla innych modułów (np. Attendance)
    Event getEventEntity(UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    private EventResponse mapToResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getType(),
                event.getStartDateTime(),
                event.getEnrollmentDeadline()
        );
    }
}