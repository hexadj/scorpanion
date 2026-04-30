package com.scorpanion.backend.session;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SessionPlayerResultRepository extends JpaRepository<SessionPlayerResultEntity, UUID> {
}


