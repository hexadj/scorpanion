package com.scorpanion.backend.session;

import com.scorpanion.backend.game.GameEntity;
import com.scorpanion.backend.shared.exception.DuplicatePlayerInSessionException;
import com.scorpanion.backend.shared.exception.InvalidGameSessionException;
import com.scorpanion.backend.shared.exception.ResourceNotFoundException;
import com.scorpanion.backend.model.ResultType;
import com.scorpanion.backend.game.GameRepository;
import com.scorpanion.backend.player.PlayerRepository;
import com.scorpanion.backend.session.command.CreateGameSessionCommand;
import com.scorpanion.backend.session.command.PlayerResultInput;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameSessionServiceImplTest {

	@Mock
	private GameRepository gameRepository;

	@Mock
	private PlayerRepository playerRepository;

	@Mock
	private GameSessionRepository gameSessionRepository;

	@Mock
	private GameSessionMapper gameSessionMapper;

	@InjectMocks
	private GameSessionServiceImpl gameSessionService;

	@Test
	void createThrowsConflictWhenSamePlayerAppearsTwice() {
		UUID gameId = UUID.randomUUID();
		UUID duplicatedPlayerId = UUID.randomUUID();

		CreateGameSessionCommand command = new CreateGameSessionCommand(
			gameId,
			Instant.parse("2026-04-18T12:30:00Z"),
			List.of(
				new PlayerResultInput(duplicatedPlayerId, 10, 1, true),
				new PlayerResultInput(duplicatedPlayerId, 8, 2, false)
			)
		);

		GameEntity game = mock(GameEntity.class);
		when(gameRepository.findById(gameId)).thenReturn(Optional.of(game));

		assertThatThrownBy(() -> gameSessionService.create(command))
			.isInstanceOf(DuplicatePlayerInSessionException.class);

		verify(gameRepository).findById(gameId);
		verify(gameSessionRepository, never()).save(any(GameSessionEntity.class));
	}

	@Test
	void createThrowsBadRequestWhenNoScoreGameContainsScore() {
		UUID gameId = UUID.randomUUID();
		UUID playerId = UUID.randomUUID();
		Instant playedAt = Instant.parse("2026-04-18T12:30:00Z");

		CreateGameSessionCommand command = new CreateGameSessionCommand(
			gameId,
			playedAt,
			List.of(new PlayerResultInput(playerId, 42, 1, true))
		);

		GameEntity noScoreGame = mock(GameEntity.class);
		when(noScoreGame.getResultType()).thenReturn(ResultType.NO_SCORE);
		when(gameRepository.findById(gameId)).thenReturn(Optional.of(noScoreGame));
		when(playerRepository.findAllById(List.of(playerId))).thenReturn(List.of());
		when(gameSessionMapper.toEntity(noScoreGame, command)).thenReturn(new GameSessionEntity(noScoreGame, playedAt));

		assertThatThrownBy(() -> gameSessionService.create(command))
			.isInstanceOf(InvalidGameSessionException.class)
			.hasMessageContaining("score must not be provided");

		verify(gameRepository).findById(gameId);
		verify(playerRepository).findAllById(List.of(playerId));
		verify(gameSessionRepository, never()).save(any(GameSessionEntity.class));
	}

	@Test
	void createThrowsNotFoundWhenGameDoesNotExist() {
		UUID missingGameId = UUID.randomUUID();
		CreateGameSessionCommand command = new CreateGameSessionCommand(
			missingGameId,
			Instant.parse("2026-04-18T12:30:00Z"),
			List.of(new PlayerResultInput(UUID.randomUUID(), null, 1, false))
		);

		when(gameRepository.findById(missingGameId)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> gameSessionService.create(command))
			.isInstanceOf(ResourceNotFoundException.class)
			.hasMessageContaining("Game not found");

		verify(gameRepository).findById(missingGameId);
		verify(gameSessionRepository, never()).save(any(GameSessionEntity.class));
	}

	@Test
	void createThrowsNotFoundWhenPlayerDoesNotExist() {
		UUID gameId = UUID.randomUUID();
		UUID missingPlayerId = UUID.randomUUID();
		Instant playedAt = Instant.parse("2026-04-18T12:30:00Z");

		CreateGameSessionCommand command = new CreateGameSessionCommand(
			gameId,
			playedAt,
			List.of(new PlayerResultInput(missingPlayerId, 7, 1, true))
		);

		GameEntity scoreGame = mock(GameEntity.class);
		when(scoreGame.getResultType()).thenReturn(ResultType.HIGHEST_SCORE);
		when(gameRepository.findById(gameId)).thenReturn(Optional.of(scoreGame));
		when(playerRepository.findAllById(List.of(missingPlayerId))).thenReturn(List.of());
		when(gameSessionMapper.toEntity(scoreGame, command)).thenReturn(new GameSessionEntity(scoreGame, playedAt));

		assertThatThrownBy(() -> gameSessionService.create(command))
			.isInstanceOf(ResourceNotFoundException.class)
			.hasMessageContaining("Player not found");

		verify(gameRepository).findById(gameId);
		verify(playerRepository).findAllById(List.of(missingPlayerId));
		verify(gameSessionRepository, never()).save(any(GameSessionEntity.class));
	}
}


