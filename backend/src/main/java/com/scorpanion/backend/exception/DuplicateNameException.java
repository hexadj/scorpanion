package com.scorpanion.backend.exception;

public class DuplicateNameException extends RuntimeException {

	private final String subCode;

	private DuplicateNameException(String resourceName, String name, String subCode) {
		super(resourceName + " name already exists: " + name);
		this.subCode = subCode;
	}

	public String getSubCode() {
		return subCode;
	}

	public static DuplicateNameException gameName(String name) {
		return new DuplicateNameException("Game", name, "GAME_NAME_ALREADY_EXISTS");
	}

	public static DuplicateNameException playerName(String name) {
		return new DuplicateNameException("Player", name, "PLAYER_NAME_ALREADY_EXISTS");
	}
}
