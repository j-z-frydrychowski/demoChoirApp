package pl.choirapp.demochoirapp.member;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import pl.choirapp.demochoirapp.member.domain.MemberFacade;
import pl.choirapp.demochoirapp.member.dto.MemberRegisterRequest;
import pl.choirapp.demochoirapp.member.dto.MemberLoginRequest;
import pl.choirapp.demochoirapp.member.dto.MemberLoginResponse;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import pl.choirapp.demochoirapp.member.dto.MemberResponse;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
class MemberController {

    private final MemberFacade memberFacade;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UUID registerMember(@RequestBody @Valid MemberRegisterRequest request) {
        return memberFacade.registerMember(request);
    }

    @PostMapping("/login")
    MemberLoginResponse login(@RequestBody @Valid MemberLoginRequest request) {
        return memberFacade.login(request);
    }

    @GetMapping("/me")
    MemberResponse getMember(Authentication authentication) {
        // 1. Spring Security wstrzykuje nam obiekt Authentication
        // 2. Pobieramy nazwę użytkownika (u nas to email), którą zapisał filtr JWT
        String userEmail = authentication.getName();

        // 3. Pytamy fasadę o dane tego konkretnego usera
        return memberFacade.getMemberByEmail(userEmail);
    }
}
