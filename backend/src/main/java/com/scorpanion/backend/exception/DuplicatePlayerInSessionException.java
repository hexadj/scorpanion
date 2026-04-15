package com.scorpanion.backend.exception;

import java.util.UUID;

public class DuplicatePlayerInSessionException extends RuntimeException {

	public DuplicatePlayerInSessionException(UUID playerId) {
		super("Player appears multiple times in the same session: " + playerId);
	}
}
