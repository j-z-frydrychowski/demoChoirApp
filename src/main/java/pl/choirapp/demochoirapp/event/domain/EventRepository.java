package pl.choirapp.demochoirapp.event.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

interface EventRepository extends JpaRepository<Event, UUID> {
    // Chcemy pobierać wydarzenia chronologicznie
    List<Event> findAllByOrderByStartDateTimeDesc();

    List<Event> findAllByHiddenFalseOrderByStartDateTimeDesc();
}