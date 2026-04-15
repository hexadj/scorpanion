package com.scorpanion.backend.service;

import com.scorpanion.backend.entity.PlayerEntity;
import com.scorpanion.backend.exception.DuplicateNameException;
import com.scorpanion.backend.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlayerServiceImpl implements PlayerService {

	private final PlayerRepository playerRepository;

	public PlayerServiceImpl(PlayerRepository playerRepository) {
		this.playerRepository = playerRepository;
	}

	@Override
	@Transactional
	public PlayerEntity create(String name) {
		String normalizedName = CommandNameRules.normalizeRequired("name", name);

		if (playerRepository.existsByNameIgnoreCase(normalizedName)) {
			throw DuplicateNameException.playerName(normalizedName);
		}

		return playerRepository.save(new PlayerEntity(normalizedName));
	}

	@Override
	@Transactional(readOnly = true)
	public List<PlayerEntity> listAll() {
		return playerRepository.findAllByOrderByNameAsc();
	}
}
