package com.scorpanion.backend.controller;

import com.scorpanion.backend.dto.CreateGameSessionRequest;
import com.scorpanion.backend.dto.GameSessionResponse;
import com.scorpanion.backend.entity.GameSessionEntity;
import com.scorpanion.backend.mapper.GameSessionMapper;
import com.scorpanion.backend.service.GameSessionService;
import com.scorpanion.backend.service.command.CreateGameSessionCommand;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/game-sessions")
public class GameSessionController {

	private final GameSessionService gameSessionService;
	private final GameSessionMapper gameSessionMapper;

	public GameSessionController(GameSessionService gameSessionService, GameSessionMapper gameSessionMapper) {
		this.gameSessionService = gameSessionService;
		this.gameSessionMapper = gameSessionMapper;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public GameSessionResponse createGameSession(@Valid @RequestBody CreateGameSessionRequest request) {
		CreateGameSessionCommand command = gameSessionMapper.toCommand(request);
		GameSessionEntity gameSession = gameSessionService.create(command);
		return gameSessionMapper.toResponse(gameSession);
	}
}
