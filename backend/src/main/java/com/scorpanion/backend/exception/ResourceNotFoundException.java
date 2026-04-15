package com.scorpanion.backend.exception;

import java.util.UUID;

public class ResourceNotFoundException extends RuntimeException {

	public ResourceNotFoundException(String resourceName, UUID resourceId) {
		super(resourceName + " not found: " + resourceId);
	}

	public static ResourceNotFoundException game(UUID gameId) {
		return new ResourceNotFoundException("Game", gameId);
	}

	public static ResourceNotFoundException player(UUID playerId) {
		return new ResourceNotFoundException("Player", playerId);
	}
}
