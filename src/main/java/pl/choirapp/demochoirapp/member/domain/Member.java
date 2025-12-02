package pl.choirapp.demochoirapp.member.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.UUID;

@Entity // mapowanie klasy na bazę danych
@Table(name = "members") // nazwa tabeli w bazie danych
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true) //email musi być unikalny
    private String email;

    @Column(nullable = false)
    private String password; //będzie dodany hash hasła

    @Enumerated(EnumType.STRING)
    private VoiceType voiceType;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    private Set<MemberRole> roles; //dodajemy w ten sposob bo jeden uzytkownik moze miec wiecej niz jedna role
}
