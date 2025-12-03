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
}
