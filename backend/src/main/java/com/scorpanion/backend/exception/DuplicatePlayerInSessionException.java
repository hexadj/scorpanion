package com.scorpanion.backend.exception;

import java.util.UUID;

public class DuplicatePlayerInSessionException extends RuntimeException {

	public static final String SUB_CODE = "DUPLICATE_PLAYER_IN_SESSION";

	public DuplicatePlayerInSessionException(UUID playerId) {
		super("Player appears multiple times in the same session: " + playerId);
	}

	public String getSubCode() {
		return SUB_CODE;
	}
}
