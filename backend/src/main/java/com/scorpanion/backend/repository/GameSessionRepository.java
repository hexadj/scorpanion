package com.scorpanion.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.scorpanion.backend.entity.GameSessionEntity;

public interface GameSessionRepository extends JpaRepository<GameSessionEntity, UUID>, GameSessionHistoryRepository {

	@EntityGraph(attributePaths = {"game", "playerResults", "playerResults.player"})
	List<GameSessionEntity> findByIdIn(Collection<UUID> ids);
	
    @EntityGraph(attributePaths = {"game", "playerResults"})
    List<GameSessionEntity> findHistoryByIdIn(Collection<UUID> ids);
}
