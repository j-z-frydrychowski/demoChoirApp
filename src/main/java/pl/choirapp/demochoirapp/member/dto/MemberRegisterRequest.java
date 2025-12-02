package pl.choirapp.demochoirapp.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import pl.choirapp.demochoirapp.member.domain.VoiceType;

public record MemberRegisterRequest (
    @NotBlank(message = "Imię jest wymagane")
    String firstName,

    @NotBlank(message = "Nazwisko jest wymagane")
    String lastName,

    @Email(message = "Nieprawidłowy format email")
    @NotBlank(message = "Email jest wymagany")
    String email,

    @NotBlank(message = "Hasło jest wymagane")
    String password,

    @NotNull(message = "Typ głosu jest wymagany")
    VoiceType voiceType) {}
