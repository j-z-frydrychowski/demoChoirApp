package pl.choirapp.demochoirapp.member.domain;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Invalid login credentials");
    }
}
