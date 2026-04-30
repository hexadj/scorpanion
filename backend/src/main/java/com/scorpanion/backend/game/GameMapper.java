package com.scorpanion.backend.game;

import com.scorpanion.backend.game.dto.CreateGameRequest;
import com.scorpanion.backend.game.dto.GameResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class GameMapper {

	public GameEntity toEntity(CreateGameRequest request) {
		Objects.requireNonNull(request, "CreateGameRequest is required.");
		return new GameEntity(request.name(), request.resultType());
	}

	public GameResponse toResponse(GameEntity game) {
		Objects.requireNonNull(game, "GameEntity is required.");
		return new GameResponse(game.getId(), game.getName(), game.getResultType());
	}

	public List<GameResponse> toResponseList(List<GameEntity> games) {
		if (games == null || games.isEmpty()) {
			return List.of();
		}
		return games.stream()
			.map(this::toResponse)
			.toList();
	}
}


