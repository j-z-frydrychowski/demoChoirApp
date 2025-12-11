package pl.choirapp.demochoirapp.attendance.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

interface MemberStatisticsRepository extends JpaRepository<MemberStatistics, UUID> {
}