package com.scorpanion.backend.repository;

import com.scorpanion.backend.entity.SessionPlayerResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SessionPlayerResultRepository extends JpaRepository<SessionPlayerResultEntity, UUID> {
}
