package pl.choirapp.demochoirapp.event.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EventType {
    REHEARSAL(1.0),  // Zwykła próba = 1 pkt
    CONCERT(2.0),    // Koncert = 2 pkt (Ważne!)
    WORKSHOP(1.5),   // Warsztaty = 1.5 pkt
    OTHER(0.5);      // Inne = 0.5 pkt

    private final double weight;
}