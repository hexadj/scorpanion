package com.scorpanion.backend.exception;

public class InvalidHistoryQueryException extends RuntimeException {

	public static final String INVALID_CURSOR_SUB_CODE = "INVALID_CURSOR";

	private final String subCode;

	private InvalidHistoryQueryException(String message, String subCode, Throwable cause) {
		super(message, cause);
		this.subCode = subCode;
	}

	private InvalidHistoryQueryException(String message, String subCode) {
		super(message);
		this.subCode = subCode;
	}

	public String getSubCode() {
		return subCode;
	}

	public static InvalidHistoryQueryException invalidCursor() {
		return new InvalidHistoryQueryException(
			"cursor must follow the '<playedAt>|<id>' format.",
			INVALID_CURSOR_SUB_CODE
		);
	}

	public static InvalidHistoryQueryException invalidCursor(Throwable cause) {
		return new InvalidHistoryQueryException(
			"cursor must follow the '<playedAt>|<id>' format.",
			INVALID_CURSOR_SUB_CODE,
			cause
		);
	}
}
