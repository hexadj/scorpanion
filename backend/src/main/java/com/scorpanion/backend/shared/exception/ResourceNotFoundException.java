package com.scorpanion.backend.shared.exception;

import java.util.UUID;

public class ResourceNotFoundException extends RuntimeException {

	private final String subCode;

	private ResourceNotFoundException(String resourceName, UUID resourceId, String subCode) {
		super(resourceName + " not found: " + resourceId);
		this.subCode = subCode;
	}

	public String getSubCode() {
		return subCode;
	}

	public static ResourceNotFoundException game(UUID gameId) {
		return new ResourceNotFoundException("Game", gameId, "GAME_NOT_FOUND");
	}

	public static ResourceNotFoundException player(UUID playerId) {
		return new ResourceNotFoundException("Player", playerId, "PLAYER_NOT_FOUND");
	}

	public static ResourceNotFoundException gameSession(UUID gameSessionId) {
		return new ResourceNotFoundException("GameSession", gameSessionId, "GAME_SESSION_NOT_FOUND");
	}
}


