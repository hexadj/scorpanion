package com.scorpanion.backend.player;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlayerRepository extends JpaRepository<PlayerEntity, UUID> {

	boolean existsByNameIgnoreCase(String name);

	List<PlayerEntity> findAllByOrderByNameAsc();
}


