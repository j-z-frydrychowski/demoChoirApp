package pl.choirapp.demochoirapp.infrastructure.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import pl.choirapp.demochoirapp.member.domain.InvalidCredentialsException;

@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    ResponseEntity<String> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Błędne dane logowania");
    }
}
