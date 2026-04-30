package com.scorpanion.backend.game;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GameRepository extends JpaRepository<GameEntity, UUID> {

	boolean existsByNameIgnoreCase(String name);

	List<GameEntity> findAllByOrderByNameAsc();
}


