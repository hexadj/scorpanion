package com.scorpanion.backend.game;

import com.scorpanion.backend.game.dto.CreateGameRequest;
import com.scorpanion.backend.game.dto.GameResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/games")
public class GameController {

	private final GameService gameService;
	private final GameMapper gameMapper;

	public GameController(GameService gameService, GameMapper gameMapper) {
		this.gameService = gameService;
		this.gameMapper = gameMapper;
	}

	@GetMapping
	public List<GameResponse> listGames() {
		return gameMapper.toResponseList(gameService.listAll());
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public GameResponse createGame(@Valid @RequestBody CreateGameRequest request) {
		GameEntity game = gameService.create(request.name(), request.resultType());
		return gameMapper.toResponse(game);
	}
}


