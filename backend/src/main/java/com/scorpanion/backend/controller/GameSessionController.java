package com.scorpanion.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.scorpanion.backend.dto.CreateGameSessionRequest;
import com.scorpanion.backend.dto.GameSessionHistoryResponse;
import com.scorpanion.backend.dto.GameSessionResponse;
import com.scorpanion.backend.entity.GameSessionEntity;
import com.scorpanion.backend.mapper.GameSessionMapper;
import com.scorpanion.backend.service.GameSessionService;
import com.scorpanion.backend.service.command.CreateGameSessionCommand;
import com.scorpanion.backend.service.command.ListGameSessionsCommand;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@Validated
@RequestMapping("/game-sessions")
public class GameSessionController {

	private final GameSessionService gameSessionService;
	private final GameSessionMapper gameSessionMapper;

	public GameSessionController(GameSessionService gameSessionService, GameSessionMapper gameSessionMapper) {
		this.gameSessionService = gameSessionService;
		this.gameSessionMapper = gameSessionMapper;
	}

	@GetMapping
	public GameSessionHistoryResponse listGameSessions(
		@RequestParam(required = false) List<UUID> gameIds,
		@RequestParam(required = false) List<UUID> playerIds,
		@RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit,
		@RequestParam(required = false) String cursor
	) {
		ListGameSessionsCommand command = new ListGameSessionsCommand(gameIds, playerIds, limit, cursor);
		return gameSessionMapper.toResponse(gameSessionService.listHistory(command));
	}

	@GetMapping("/{id}")
	public GameSessionResponse getGameSession(@PathVariable UUID id) {
		GameSessionEntity gameSession = gameSessionService.get(id);
		return gameSessionMapper.toResponse(gameSession);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public GameSessionResponse createGameSession(@Valid @RequestBody CreateGameSessionRequest request) {
		CreateGameSessionCommand command = gameSessionMapper.toCommand(request);
		GameSessionEntity gameSession = gameSessionService.create(command);
		return gameSessionMapper.toResponse(gameSession);
	}
}
