package pl.choirapp.demochoirapp.member.domain;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.choirapp.demochoirapp.member.dto.MemberRegisterRequest;

import java.util.UUID;

@Service
@Transactional //kazda metoda w tej klasie jest transakcja
@RequiredArgsConstructor
class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    UUID registerMember(MemberRegisterRequest request) {
        if (memberRepository.existsByEmail(request.email())) {
            throw new MemberAlreadyExistsException(request.email());
        }

       String encryptedPassword = passwordEncoder.encode(request.password());

        Member member = Member.create(
            request.firstName(),
            request.lastName(),
            request.email(),
            encryptedPassword,
            request.voiceType()
        );

        Member savedMember = memberRepository.save(member);

        return savedMember.getId();
    }
}
