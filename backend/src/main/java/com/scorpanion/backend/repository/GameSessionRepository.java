package com.scorpanion.backend.repository;

import com.scorpanion.backend.entity.GameSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GameSessionRepository extends JpaRepository<GameSessionEntity, UUID> {
}
