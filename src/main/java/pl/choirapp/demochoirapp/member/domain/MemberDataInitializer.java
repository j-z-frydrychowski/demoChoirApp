package pl.choirapp.demochoirapp.member.domain;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class MemberDataInitializer implements CommandLineRunner {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (memberRepository.count() == 0) {
            System.out.println(">>> TWORZENIE KONTA ADMINISTRATORA <<<");

            Member admin = Member.create(
                    "Admin",
                    "Systemowy",
                    "admin@choir.com",
                    passwordEncoder.encode("admin123"), // Hasło: admin123
                    VoiceType.BASS_2 // Admin też musi mieć głos ;)
            );

            // Nadpisujemy rolę na ADMIN (bo metoda create domyślnie daje CHORISTER)
            admin.setRoles(Set.of(MemberRole.ADMIN, MemberRole.BOARD));
            admin.setStatus(MemberStatus.ACTIVE); // Od razu aktywny

            memberRepository.save(admin);
            System.out.println(">>> ADMINISTRATOR UTWORZONY: admin@choir.com / admin123 <<<");
        }
    }

}