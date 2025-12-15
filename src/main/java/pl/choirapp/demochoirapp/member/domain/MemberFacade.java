package pl.choirapp.demochoirapp.member.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.choirapp.demochoirapp.member.dto.*;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MemberFacade {
    private final MemberService memberService;

    public UUID registerMember(MemberRegisterRequest request) {
        return memberService.registerMember(request);
    }

    public MemberLoginResponse login(MemberLoginRequest request) {
        return memberService.login(request);
    }

    public MemberSecurityDto findByEmail(String email) {
        return memberService.findByEmail(email);
    }

    public MemberResponse getMemberByEmail(String email) {
        return memberService.getMemberByEmail(email);
    }

    public List<MemberResponse> getAllMembers() {
        return memberService.getAllMembers();
    }

    public void activateMember(UUID id) {
        memberService.activateMember(id);
    }

    public void deleteMember(UUID id) {
        memberService.deleteMember(id);
    }
}
