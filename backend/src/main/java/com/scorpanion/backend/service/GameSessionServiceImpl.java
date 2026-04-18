package com.scorpanion.backend.service;

import com.scorpanion.backend.entity.GameEntity;
import com.scorpanion.backend.entity.GameSessionEntity;
import com.scorpanion.backend.entity.PlayerEntity;
import com.scorpanion.backend.entity.SessionPlayerResultEntity;
import com.scorpanion.backend.exception.DuplicatePlayerInSessionException;
import com.scorpanion.backend.exception.InvalidHistoryQueryException;
import com.scorpanion.backend.exception.InvalidGameSessionException;
import com.scorpanion.backend.exception.ResourceNotFoundException;
import com.scorpanion.backend.mapper.GameSessionMapper;
import com.scorpanion.backend.model.ResultType;
import com.scorpanion.backend.repository.GameRepository;
import com.scorpanion.backend.repository.GameSessionRepository;
import com.scorpanion.backend.repository.PlayerRepository;
import com.scorpanion.backend.service.command.CreateGameSessionCommand;
import com.scorpanion.backend.service.command.ListGameSessionsCommand;
import com.scorpanion.backend.service.command.PlayerResultInput;
import com.scorpanion.backend.service.result.GameSessionHistoryPage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GameSessionServiceImpl implements GameSessionService {

	private final GameRepository gameRepository;
	private final PlayerRepository playerRepository;
	private final GameSessionRepository gameSessionRepository;
	private final GameSessionMapper gameSessionMapper;

	public GameSessionServiceImpl(
		GameRepository gameRepository,
		PlayerRepository playerRepository,
		GameSessionRepository gameSessionRepository,
		GameSessionMapper gameSessionMapper
	) {
		this.gameRepository = gameRepository;
		this.playerRepository = playerRepository;
		this.gameSessionRepository = gameSessionRepository;
		this.gameSessionMapper = gameSessionMapper;
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
		Map<UUID, PlayerEntity> playersById = resolvePlayersById(command.playerResults());

		GameSessionEntity gameSession = gameSessionMapper.toEntity(game, command);
		for (PlayerResultInput playerResult : command.playerResults()) {
			validatePlayerResult(game.getResultType(), playerResult);
			PlayerEntity player = playersById.get(playerResult.playerId());
			if (player == null) {
				throw ResourceNotFoundException.player(playerResult.playerId());
			}

			SessionPlayerResultEntity sessionPlayerResult = gameSessionMapper.toEntity(player, playerResult);
			gameSession.addPlayerResult(sessionPlayerResult);
		}

		return gameSessionRepository.save(gameSession);
	}

	@Override
	@Transactional(readOnly = true)
	public GameSessionHistoryPage listHistory(ListGameSessionsCommand command) {
		Objects.requireNonNull(command, "ListGameSessionsCommand is required.");
		if (command.limit() < 1) {
			throw new IllegalArgumentException("limit must be greater than or equal to 1.");
		}

		Cursor cursor = parseCursor(command.cursor());
		Set<UUID> gameIdFilter = Set.copyOf(command.gameIds());
		Set<UUID> playerIdFilter = Set.copyOf(command.playerIds());

		List<UUID> pageIdPlusOne = gameSessionRepository.findHistoryPageIds(
			gameIdFilter,
			playerIdFilter,
			cursor == null ? null : cursor.playedAt(),
			cursor == null ? null : cursor.id(),
			command.limit() + 1
		);

		boolean hasMore = pageIdPlusOne.size() > command.limit();
		List<UUID> pageIds = hasMore
			? pageIdPlusOne.subList(0, command.limit())
			: pageIdPlusOne;

		if (pageIds.isEmpty()) {
			return new GameSessionHistoryPage(List.of(), null, false);
		}

		List<GameSessionEntity> page = sortByRequestedOrder(
			gameSessionRepository.findByIdIn(pageIds),
			pageIds
		);

		String nextCursor = hasMore && !page.isEmpty()
			? encodeCursor(page.get(page.size() - 1))
			: null;

		return new GameSessionHistoryPage(page, nextCursor, hasMore);
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
		switch (resultType) {
			case NO_SCORE -> {
				if (playerResult.score() != null) {
					throw new InvalidGameSessionException("score must not be provided for NO_SCORE games.");
				}
			}
			case HIGHEST_SCORE, LOWEST_SCORE -> {
				// No additional validation for score-based game types
			}
		}
	}

	private Map<UUID, PlayerEntity> resolvePlayersById(List<PlayerResultInput> playerResults) {
		List<UUID> playerIds = playerResults.stream()
			.map(PlayerResultInput::playerId)
			.toList();

		return playerRepository.findAllById(playerIds).stream()
			.collect(Collectors.toMap(PlayerEntity::getId, Function.identity()));
	}

	private List<GameSessionEntity> sortByRequestedOrder(List<GameSessionEntity> gameSessions, List<UUID> orderedIds) {
		Map<UUID, Integer> orderById = new HashMap<>();
		for (int index = 0; index < orderedIds.size(); index++) {
			orderById.put(orderedIds.get(index), index);
		}

		return gameSessions.stream()
			.sorted(Comparator.comparingInt(gameSession -> orderById.getOrDefault(gameSession.getId(), Integer.MAX_VALUE)))
			.toList();
	}

	private Cursor parseCursor(String rawCursor) {
		if (rawCursor == null) {
			return null;
		}

		String[] parts = rawCursor.split("\\|", 2);
		if (parts.length != 2) {
			throw InvalidHistoryQueryException.invalidCursor();
		}

		try {
			Instant playedAt = Instant.parse(parts[0]);
			UUID id = UUID.fromString(parts[1]);
			return new Cursor(playedAt, id);
		} catch (RuntimeException exception) {
			throw InvalidHistoryQueryException.invalidCursor(exception);
		}
	}

	private String encodeCursor(GameSessionEntity session) {
		return session.getPlayedAt() + "|" + session.getId();
	}

	private record Cursor(Instant playedAt, UUID id) {
	}
}
