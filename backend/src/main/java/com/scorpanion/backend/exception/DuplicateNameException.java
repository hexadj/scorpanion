package com.scorpanion.backend.exception;

public class DuplicateNameException extends RuntimeException {

	public DuplicateNameException(String resourceName, String name) {
		super(resourceName + " name already exists: " + name);
	}

	public static DuplicateNameException gameName(String name) {
		return new DuplicateNameException("Game", name);
	}

	public static DuplicateNameException playerName(String name) {
		return new DuplicateNameException("Player", name);
	}
}
