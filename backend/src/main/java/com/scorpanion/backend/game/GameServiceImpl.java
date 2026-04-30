package com.scorpanion.backend.game;

import com.scorpanion.backend.shared.exception.DuplicateNameException;
import com.scorpanion.backend.model.ResultType;
import com.scorpanion.backend.session.command.CommandNameRules;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class GameServiceImpl implements GameService {

	private final GameRepository gameRepository;

	public GameServiceImpl(GameRepository gameRepository) {
		this.gameRepository = gameRepository;
	}

	@Override
	@Transactional
	public GameEntity create(String name, ResultType resultType) {
		String normalizedName = CommandNameRules.normalizeRequired("name", name);
		Objects.requireNonNull(resultType, "resultType is required.");

		if (gameRepository.existsByNameIgnoreCase(normalizedName)) {
			throw DuplicateNameException.gameName(normalizedName);
		}

		return gameRepository.save(new GameEntity(normalizedName, resultType));
	}

	@Override
	@Transactional(readOnly = true)
	public List<GameEntity> listAll() {
		return gameRepository.findAllByOrderByNameAsc();
	}
}


