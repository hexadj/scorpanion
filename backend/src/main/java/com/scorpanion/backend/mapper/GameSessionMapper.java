package com.scorpanion.backend.mapper;

import com.scorpanion.backend.dto.CreateGameSessionRequest;
import com.scorpanion.backend.dto.GameSessionHistoryItemResponse;
import com.scorpanion.backend.dto.GameSessionHistoryResponse;
import com.scorpanion.backend.dto.GameSessionResponse;
import com.scorpanion.backend.dto.SessionPlayerResultRequest;
import com.scorpanion.backend.dto.SessionPlayerResultResponse;
import com.scorpanion.backend.entity.GameEntity;
import com.scorpanion.backend.entity.GameSessionEntity;
import com.scorpanion.backend.entity.PlayerEntity;
import com.scorpanion.backend.entity.SessionPlayerResultEntity;
import com.scorpanion.backend.service.command.CreateGameSessionCommand;
import com.scorpanion.backend.service.command.PlayerResultInput;
import com.scorpanion.backend.service.result.GameSessionHistoryPage;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class GameSessionMapper {

	public CreateGameSessionCommand toCommand(CreateGameSessionRequest request) {
		Objects.requireNonNull(request, "CreateGameSessionRequest is required.");
		List<PlayerResultInput> playerResults = request.playerResults() == null
			? List.of()
			: request.playerResults().stream()
				.map(this::toPlayerResultInput)
				.toList();

		return new CreateGameSessionCommand(
			request.gameId(),
			request.playedAt(),
			playerResults
		);
	}

	public GameSessionEntity toEntity(GameEntity game, CreateGameSessionCommand command) {
		Objects.requireNonNull(game, "GameEntity is required.");
		Objects.requireNonNull(command, "CreateGameSessionCommand is required.");
		return new GameSessionEntity(game, command.playedAt());
	}

	public SessionPlayerResultEntity toEntity(PlayerEntity player, PlayerResultInput input) {
		Objects.requireNonNull(player, "PlayerEntity is required.");
		Objects.requireNonNull(input, "PlayerResultInput is required.");

		return new SessionPlayerResultEntity(
			player,
			input.score(),
			input.rank(),
			input.isWinner()
		);
	}

	public GameSessionResponse toResponse(GameSessionEntity gameSession) {
		Objects.requireNonNull(gameSession, "GameSessionEntity is required.");
		List<SessionPlayerResultResponse> playerResults = gameSession.getPlayerResults().stream()
			.map(this::toResponse)
			.toList();

		return new GameSessionResponse(
			gameSession.getId(),
			gameSession.getGame().getId(),
			gameSession.getPlayedAt(),
			playerResults
		);
	}

	public GameSessionHistoryResponse toResponse(GameSessionHistoryPage historyPage) {
		Objects.requireNonNull(historyPage, "GameSessionHistoryPage is required.");

		List<GameSessionHistoryItemResponse> gameSessionsHistoryItems = historyPage.gameSessions().stream()
			.map(this::toHistoryItemResponse)
			.toList();

		return new GameSessionHistoryResponse(
			gameSessionsHistoryItems,
			historyPage.nextCursor(),
			historyPage.hasMore()
		);
	}

	public GameSessionHistoryItemResponse toHistoryItemResponse(GameSessionEntity gameSession) {
		Objects.requireNonNull(gameSession, "GameSessionEntity is required.");
		return new GameSessionHistoryItemResponse(
			gameSession.getId(),
			gameSession.getPlayedAt(),
			gameSession.getGame().getName(),
			gameSession.getPlayerResults().size()
		);
	}

	private PlayerResultInput toPlayerResultInput(SessionPlayerResultRequest request) {
		Objects.requireNonNull(request, "SessionPlayerResultRequest is required.");
		boolean isWinner = Objects.requireNonNull(request.isWinner(), "isWinner is required.");
		return new PlayerResultInput(
			request.playerId(),
			request.score(),
			request.rank(),
			isWinner
		);
	}

	private SessionPlayerResultResponse toResponse(SessionPlayerResultEntity playerResult) {
		Objects.requireNonNull(playerResult, "SessionPlayerResultEntity is required.");
		return new SessionPlayerResultResponse(
			playerResult.getId(),
			playerResult.getPlayer().getId(),
			playerResult.getScore(),
			playerResult.getRank(),
			playerResult.isWinner()
		);
	}
}
