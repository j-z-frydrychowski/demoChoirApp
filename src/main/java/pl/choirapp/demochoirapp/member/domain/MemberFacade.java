package pl.choirapp.demochoirapp.member.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.choirapp.demochoirapp.member.dto.MemberRegisterRequest;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MemberFacade {
    private final MemberService memberService;

    public UUID registerMember(MemberRegisterRequest request) {
        return memberService.registerMember(request);
    }
}
