package pl.choirapp.demochoirapp.member.domain;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.choirapp.demochoirapp.member.dto.MemberLoginRequest;
import pl.choirapp.demochoirapp.member.dto.MemberLoginResponse;
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

    MemberLoginResponse login(MemberLoginRequest request) {
        // Szukamy uzytkownika po emailu, jeśli nie znajdzie -> błąd
        Member member = memberRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException());

        // Sprawdzamy hasło używając matchera

        if (!passwordEncoder.matches(request.password(), member.getPassword())) {
            throw new InvalidCredentialsException();
        }
        // 3. Jeśli przeszło -> Generujemy odpowiedź
        // TODO: Tutaj w przyszłości wygenerujemy prawdziwy JWT Token
        return new MemberLoginResponse("DUMMY_TOKEN_FOR_USER_" + member.getId());
    }
}
