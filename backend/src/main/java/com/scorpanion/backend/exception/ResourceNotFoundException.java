package com.scorpanion.backend.exception;

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
}
