package com.scorpanion.backend.shared.exception;

public class StatsValidationException extends RuntimeException {

	private final String errorCode;

	public StatsValidationException(String errorCode, String message) {
		super(message);
		this.errorCode = errorCode;
	}

	public String getErrorCode() {
		return errorCode;
	}
}


