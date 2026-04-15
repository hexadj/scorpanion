package com.scorpanion.backend.repository;

import com.scorpanion.backend.entity.PlayerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlayerRepository extends JpaRepository<PlayerEntity, UUID> {

	boolean existsByNameIgnoreCase(String name);

	List<PlayerEntity> findAllByOrderByNameAsc();
}
