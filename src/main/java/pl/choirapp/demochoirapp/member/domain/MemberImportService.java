package pl.choirapp.demochoirapp.member.domain;

import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
class MemberImportService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void importMembers(MultipartFile file) {
        try (InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            // Konfiguracja: Separator to średnik (;) - standard w polskim Excelu
            CSVReader csvReader = new CSVReaderBuilder(reader)
                    .withCSVParser(new CSVParserBuilder().withSeparator(';').build())
                    .withSkipLines(1) // Pomijamy nagłówek
                    .build();

            List<String[]> rows = csvReader.readAll();
            String defaultPassword = passwordEncoder.encode("Choir2025!");

            for (String[] row : rows) {
                // Weryfikacja czy wiersz nie jest pusty
                if (row.length < 3) continue;

                // Indeksy kolumn zgodnie z ustalonym szablonem (patrz niżej):
                // 0: Imię
                // 1: Nazwisko
                // 2: Email
                // 3: Głos (SOPRANO, ALTO...)
                // 4: Telefon (opcjonalne)
                // 5: Data dołączenia (RRRR-MM-DD) (opcjonalne)
                // 6: Facebook URL (opcjonalne)
                // 7: Funkcja (informacyjnie)

                String email = row[2].trim();
                // Walidacja: czy email istnieje?
                if (email.isEmpty() || memberRepository.existsByEmail(email)) {
                    continue;
                }

                Member member = new Member();
                member.setFirstName(row[0].trim());
                member.setLastName(row[1].trim());
                member.setEmail(email);

                // Parsowanie głosu (fallback do SOPRANO w razie błędu/literówki)
                try {
                    String voiceStr = row[3].trim().toUpperCase();
                    member.setVoiceType(VoiceType.valueOf(voiceStr));
                } catch (IllegalArgumentException | ArrayIndexOutOfBoundsException e) {
                    member.setVoiceType(VoiceType.SOPRANO);
                }

                // Telefon (zabezpieczenie przed brakiem kolumny lub pustą wartością)
                member.setPhoneNumber(getValueOrNull(row, 4));

                // Data dołączenia
                try {
                    String dateStr = getValueOrNull(row, 5);
                    if (dateStr != null) {
                        member.setJoinedDate(LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE));
                    }
                } catch (Exception e) {
                    // Ignorujemy błędną datę, pole zostanie null
                }

                member.setFacebookUrl(getValueOrNull(row, 6));

                // Ustawienia systemowe
                member.setPassword(defaultPassword);
                member.setStatus(MemberStatus.ACTIVE);

                // Rola - ZGODNIE Z WYMOGIEM: MemberRole.MEMBER
                Set<MemberRole> roles = new HashSet<>();
                roles.add(MemberRole.CHORISTER);
                member.setRoles(roles);

                memberRepository.save(member);
            }
        } catch (Exception e) {
            throw new RuntimeException("Błąd importu pliku CSV: " + e.getMessage());
        }
    }

    // Helper do bezpiecznego pobierania wartości
    private String getValueOrNull(String[] row, int index) {
        if (index >= row.length || row[index].isBlank()) {
            return null;
        }
        return row[index].trim();
    }
}