package pl.choirapp.demochoirapp.member.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Period; // Do liczenia stażu
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoiceType voiceType;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<MemberRole> roles = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status;

    // --- NOWE POLA ---
    private String phoneNumber;
    private String facebookUrl;
    private LocalDate joinedDate;

    // --- LOGIKA BIZNESOWA ---

    // Czy jest seniorem? (> 7 lat stażu)
    public boolean isSenior() {
        if (joinedDate == null) return false;
        return Period.between(joinedDate, LocalDate.now()).getYears() >= 7;
    }

    public static Member create(String firstName, String lastName, String email, String password, VoiceType voiceType) {
        return Member.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(password)
                .voiceType(voiceType)
                .status(MemberStatus.PENDING)
                .roles(Set.of(MemberRole.CHORISTER))
                .build();
    }
}