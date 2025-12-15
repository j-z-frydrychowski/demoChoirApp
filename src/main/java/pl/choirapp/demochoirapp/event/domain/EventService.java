package pl.choirapp.demochoirapp.event.domain;

import jakarta.transaction.Transactional;
import org.springframework.context.annotation.Lazy; // <--- WAŻNY IMPORT
import org.springframework.stereotype.Service;
import pl.choirapp.demochoirapp.event.dto.CreateEventRequest;
import pl.choirapp.demochoirapp.event.dto.EventResponse;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
// Usuwamy @RequiredArgsConstructor, bo musimy dodać @Lazy ręcznie w konstruktorze
class EventService {

    private final EventRepository eventRepository;

    // Zależności z innych modułów
    private final pl.choirapp.demochoirapp.attendance.domain.AttendanceFacade attendanceFacade;
    private final pl.choirapp.demochoirapp.enrollment.domain.EnrollmentFacade enrollmentFacade;

    // --- RĘCZNY KONSTRUKTOR Z @Lazy ---
    // Dzięki @Lazy Spring przerwie cykl zależności
    public EventService(
            EventRepository eventRepository,
            @Lazy pl.choirapp.demochoirapp.attendance.domain.AttendanceFacade attendanceFacade,
            @Lazy pl.choirapp.demochoirapp.enrollment.domain.EnrollmentFacade enrollmentFacade
    ) {
        this.eventRepository = eventRepository;
        this.attendanceFacade = attendanceFacade;
        this.enrollmentFacade = enrollmentFacade;
    }

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
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
    }

    // Metoda usuwająca (to ona wywołuje cykl, ale teraz @Lazy to obsłuży)
    void deleteEvent(UUID eventId) {
        // 1. Czyścimy powiązane dane (Spring doładuje te beany w tym momencie)
        attendanceFacade.deleteAllForEvent(eventId);
        enrollmentFacade.deleteAllForEvent(eventId);

        // 2. Usuwamy samo wydarzenie
        eventRepository.deleteById(eventId);
    }

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