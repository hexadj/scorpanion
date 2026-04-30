package com.scorpanion.backend.stats.model;

public enum Scope {

	GLOBAL("global"),
	PLAYER("player"),
	GAME("game");

	private final String value;

	Scope(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static Scope fromValue(String value) {
		for (Scope scope : values()) {
			if (scope.value.equals(value)) {
				return scope;
			}
		}
		return null;
	}
}


