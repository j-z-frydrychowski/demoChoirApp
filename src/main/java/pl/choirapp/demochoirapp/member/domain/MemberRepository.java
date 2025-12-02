package pl.choirapp.demochoirapp.member.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.Optional;

interface MemberRepository extends JpaRepository<Member, UUID>{

    //spring sam wygeneruje zapytanie SQL: SELECT * FROM members WHERE email = ?
    Optional<Member> findByEmail(String email);

    //spring sam wygeneruje zapytanie SQL: SELECT COUNT(*) > 0 FROM members WHERE email = ?
    boolean existsByEmail(String email);
}
