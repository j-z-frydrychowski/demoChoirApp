package pl.choirapp.demochoirapp.member.domain;

import jakarta.transaction.Transactional;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.choirapp.demochoirapp.infrastructure.security.JwtService;
import pl.choirapp.demochoirapp.member.dto.*;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // Fasady z innych modułów (Lazy loading)
    private final pl.choirapp.demochoirapp.attendance.domain.AttendanceFacade attendanceFacade;
    private final pl.choirapp.demochoirapp.enrollment.domain.EnrollmentFacade enrollmentFacade;
    private final pl.choirapp.demochoirapp.emission.domain.EmissionFacade emissionFacade;
    private final pl.choirapp.demochoirapp.attendance.domain.StatisticsFacade statisticsFacade;

    // Ręczny konstruktor dla @Lazy
    public MemberService(
            MemberRepository memberRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Lazy pl.choirapp.demochoirapp.attendance.domain.AttendanceFacade attendanceFacade,
            @Lazy pl.choirapp.demochoirapp.enrollment.domain.EnrollmentFacade enrollmentFacade,
            @Lazy pl.choirapp.demochoirapp.emission.domain.EmissionFacade emissionFacade,
            @Lazy pl.choirapp.demochoirapp.attendance.domain.StatisticsFacade statisticsFacade
    ) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.attendanceFacade = attendanceFacade;
        this.enrollmentFacade = enrollmentFacade;
        this.emissionFacade = emissionFacade;
        this.statisticsFacade = statisticsFacade;
    }

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
        Member member = memberRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), member.getPassword())) {
            throw new InvalidCredentialsException();
        }
        String jwtToken = jwtService.generateToken(member.getId(), member.getEmail());
        return new MemberLoginResponse(jwtToken);
    }

    MemberSecurityDto findByEmail(String email) {
        return memberRepository.findByEmail(email)
                .map(member -> new MemberSecurityDto(
                        member.getId(),
                        member.getEmail(),
                        member.getPassword(),
                        member.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toSet())
                ))
                .orElseThrow(InvalidCredentialsException::new);
    }

    MemberResponse getMemberByEmail(String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);
        return mapToResponse(member);
    }

    List<MemberResponse> getAllMembers() {
        return memberRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    void activateMember(UUID memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setStatus(MemberStatus.ACTIVE);
        memberRepository.save(member);
    }

    // --- NOWA METODA ---
    void deleteMember(UUID memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new RuntimeException("Member not found");
        }
        // 1. Wyczyść zależności
        attendanceFacade.deleteAllForMember(memberId);
        enrollmentFacade.deleteAllForMember(memberId);
        emissionFacade.releaseSlotsForMember(memberId);
        statisticsFacade.deleteStatisticsForMember(memberId);

        // 2. Usuń użytkownika
        memberRepository.deleteById(memberId);
    }

    private MemberResponse mapToResponse(Member member) {
        return new MemberResponse(
                member.getId(),
                member.getFirstName(),
                member.getLastName(),
                member.getEmail(),
                member.getVoiceType(),
                member.getRoles(),
                member.getStatus()
        );
    }
}