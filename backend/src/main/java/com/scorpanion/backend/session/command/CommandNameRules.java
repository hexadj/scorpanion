package com.scorpanion.backend.session.command;

public final class CommandNameRules {

	private CommandNameRules() {
	}

	public static String normalizeRequired(String fieldName, String value) {
		if (value == null) {
			throw new IllegalArgumentException(fieldName + " is required.");
		}

		String normalized = value.trim();
		if (normalized.isEmpty()) {
			throw new IllegalArgumentException(fieldName + " must not be blank.");
		}

		return normalized;
	}
}


