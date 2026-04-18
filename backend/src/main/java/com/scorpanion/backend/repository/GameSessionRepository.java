package com.scorpanion.backend.repository;

import com.scorpanion.backend.entity.GameSessionEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface GameSessionRepository extends JpaRepository<GameSessionEntity, UUID>, GameSessionHistoryRepository {

	@EntityGraph(attributePaths = {"game", "playerResults", "playerResults.player"})
	List<GameSessionEntity> findByIdIn(Collection<UUID> ids);
}
