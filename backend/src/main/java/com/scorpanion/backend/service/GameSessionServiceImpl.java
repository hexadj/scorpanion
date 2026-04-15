package com.scorpanion.backend.service;

import com.scorpanion.backend.entity.GameEntity;
import com.scorpanion.backend.entity.GameSessionEntity;
import com.scorpanion.backend.entity.PlayerEntity;
import com.scorpanion.backend.entity.ResultType;
import com.scorpanion.backend.entity.SessionPlayerResultEntity;
import com.scorpanion.backend.exception.DuplicatePlayerInSessionException;
import com.scorpanion.backend.exception.InvalidGameSessionException;
import com.scorpanion.backend.exception.ResourceNotFoundException;
import com.scorpanion.backend.repository.GameRepository;
import com.scorpanion.backend.repository.GameSessionRepository;
import com.scorpanion.backend.repository.PlayerRepository;
import com.scorpanion.backend.service.command.CreateGameSessionCommand;
import com.scorpanion.backend.service.command.PlayerResultInput;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class GameSessionServiceImpl implements GameSessionService {

	private final GameRepository gameRepository;
	private final PlayerRepository playerRepository;
	private final GameSessionRepository gameSessionRepository;

	public GameSessionServiceImpl(
		GameRepository gameRepository,
		PlayerRepository playerRepository,
		GameSessionRepository gameSessionRepository
	) {
		this.gameRepository = gameRepository;
		this.playerRepository = playerRepository;
		this.gameSessionRepository = gameSessionRepository;
	}

	@Override
	@Transactional
	public GameSessionEntity create(CreateGameSessionCommand command) {
		if (command == null) {
			throw new InvalidGameSessionException("Game session command is required.");
		}
		if (command.gameId() == null) {
			throw new InvalidGameSessionException("gameId is required.");
		}
		if (command.playedAt() == null) {
			throw new InvalidGameSessionException("playedAt is required.");
		}
		if (command.playerResults().isEmpty()) {
			throw new InvalidGameSessionException("playerResults must contain at least one entry.");
		}

		GameEntity game = gameRepository.findById(command.gameId())
			.orElseThrow(() -> ResourceNotFoundException.game(command.gameId()));

		validateUniquePlayers(command.playerResults());

		GameSessionEntity gameSession = new GameSessionEntity(game, command.playedAt());
		for (PlayerResultInput playerResult : command.playerResults()) {
			validatePlayerResult(game.getResultType(), playerResult);

			PlayerEntity player = playerRepository.findById(playerResult.playerId())
				.orElseThrow(() -> ResourceNotFoundException.player(playerResult.playerId()));

			SessionPlayerResultEntity sessionPlayerResult = new SessionPlayerResultEntity(
				player,
				playerResult.score(),
				playerResult.rank(),
				playerResult.isWinner()
			);
			gameSession.addPlayerResult(sessionPlayerResult);
		}

		return gameSessionRepository.save(gameSession);
	}

	private void validateUniquePlayers(List<PlayerResultInput> playerResults) {
		Set<UUID> seenPlayerIds = new HashSet<>();
		for (PlayerResultInput playerResult : playerResults) {
			if (playerResult == null) {
				throw new InvalidGameSessionException("playerResults entries must not be null.");
			}
			if (playerResult.playerId() == null) {
				throw new InvalidGameSessionException("playerId is required for each player result.");
			}
			if (!seenPlayerIds.add(playerResult.playerId())) {
				throw new DuplicatePlayerInSessionException(playerResult.playerId());
			}
		}
	}

	private void validatePlayerResult(ResultType resultType, PlayerResultInput playerResult) {
		if (playerResult.isWinner() == null) {
			throw new InvalidGameSessionException("isWinner is required for each player result.");
		}
		if (resultType == ResultType.NO_SCORE && playerResult.score() != null) {
			throw new InvalidGameSessionException("score must not be provided for NO_SCORE games.");
		}
	}
}
