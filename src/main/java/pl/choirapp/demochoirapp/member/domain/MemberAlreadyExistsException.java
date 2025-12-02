package pl.choirapp.demochoirapp.member.domain;

public class MemberAlreadyExistsException extends RuntimeException {
    public MemberAlreadyExistsException(String email) {
        super("Użytkownik o emailu " + email + " już istnieje.");
    }
}
