package com.scorpanion.backend.player;

import com.scorpanion.backend.player.dto.CreatePlayerRequest;
import com.scorpanion.backend.player.dto.PlayerResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class PlayerMapper {

	public PlayerEntity toEntity(CreatePlayerRequest request) {
		Objects.requireNonNull(request, "CreatePlayerRequest is required.");
		return new PlayerEntity(request.name());
	}

	public PlayerResponse toResponse(PlayerEntity player) {
		Objects.requireNonNull(player, "PlayerEntity is required.");
		return new PlayerResponse(player.getId(), player.getName());
	}

	public List<PlayerResponse> toResponseList(List<PlayerEntity> players) {
		if (players == null || players.isEmpty()) {
			return List.of();
		}
		return players.stream()
			.map(this::toResponse)
			.toList();
	}
}


