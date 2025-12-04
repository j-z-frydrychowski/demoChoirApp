package pl.choirapp.demochoirapp.member.domain;

public enum MemberStatus {
    PENDING,   // Nowo zarejestrowany, czeka na akceptację zarządu
    ACTIVE,    // Pełnoprawny chórzysta
    SUSPENDED, // Zawieszony / Urlopowany
    ARCHIVED   // Były członek (nie usuwamy danych historycznych!)
}