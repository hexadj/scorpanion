package com.scorpanion.backend.repository;

import com.scorpanion.backend.entity.GameEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GameRepository extends JpaRepository<GameEntity, UUID> {

	boolean existsByNameIgnoreCase(String name);

	List<GameEntity> findAllByOrderByNameAsc();
}
