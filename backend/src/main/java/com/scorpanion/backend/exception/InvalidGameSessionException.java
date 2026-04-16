package com.scorpanion.backend.exception;

public class InvalidGameSessionException extends RuntimeException {

	public static final String SUB_CODE = "GAME_SESSION_INVALID";

	public InvalidGameSessionException(String message) {
		super(message);
	}

	public String getSubCode() {
		return SUB_CODE;
	}
}
