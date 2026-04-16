package com.scorpanion.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestControllerAdvice
public class ApiExceptionHandler {

	private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ProblemDetail handleMethodArgumentNotValid(MethodArgumentNotValidException exception) {
		ProblemDetail problem = problem(
			HttpStatus.BAD_REQUEST,
			"INVALID_REQUEST",
			"PAYLOAD_VALIDATION_FAILED",
			"Request payload validation failed."
		);
		List<String> fieldErrors = exception.getBindingResult().getFieldErrors().stream()
			.map(this::formatFieldError)
			.toList();
		problem.setProperty("fieldErrors", fieldErrors);
		return problem;
	}

	@ExceptionHandler(HandlerMethodValidationException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ProblemDetail handleHandlerMethodValidation(HandlerMethodValidationException exception) {
		LOGGER.debug("Handler method validation failed", exception);
		return problem(
			HttpStatus.BAD_REQUEST,
			"INVALID_REQUEST",
			"PARAMETER_VALIDATION_FAILED",
			"Request parameter validation failed."
		);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ProblemDetail handleMessageNotReadable(HttpMessageNotReadableException exception) {
		LOGGER.debug("Malformed request body", exception);
		return problem(
			HttpStatus.BAD_REQUEST,
			"INVALID_REQUEST",
			"MALFORMED_JSON",
			"Malformed request body."
		);
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ProblemDetail handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException exception) {
		LOGGER.debug("Invalid parameter type", exception);
		return problem(
			HttpStatus.BAD_REQUEST,
			"INVALID_REQUEST",
			"INVALID_PARAMETER_TYPE",
			"Invalid parameter type."
		);
	}

	@ExceptionHandler({
		InvalidGameSessionException.class,
		IllegalArgumentException.class
	})
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ProblemDetail handleBadRequest(RuntimeException exception) {
		if (exception instanceof InvalidGameSessionException invalidGameSessionException) {
			return problem(
				HttpStatus.BAD_REQUEST,
				"INVALID_REQUEST",
				invalidGameSessionException.getSubCode(),
				"Game session payload is invalid."
			);
		}

		return problem(
			HttpStatus.BAD_REQUEST,
			"INVALID_REQUEST",
			"INVALID_ARGUMENT",
			"Request payload is invalid."
		);
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ProblemDetail handleNotFound(ResourceNotFoundException exception) {
		return problem(
			HttpStatus.NOT_FOUND,
			"RESOURCE_NOT_FOUND",
			exception.getSubCode(),
			"Requested resource was not found."
		);
	}

	@ExceptionHandler({
		DuplicateNameException.class,
		DuplicatePlayerInSessionException.class
	})
	@ResponseStatus(HttpStatus.CONFLICT)
	public ProblemDetail handleConflict(RuntimeException exception) {
		if (exception instanceof DuplicateNameException duplicateNameException) {
			return problem(
				HttpStatus.CONFLICT,
				"CONFLICT",
				duplicateNameException.getSubCode(),
				"A resource with the same name already exists."
			);
		}

		return problem(
			HttpStatus.CONFLICT,
			"CONFLICT",
			DuplicatePlayerInSessionException.SUB_CODE,
			"A player cannot appear multiple times in one session."
		);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	public ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException exception) {
		LOGGER.warn("Data integrity violation", exception);
		return problem(
			HttpStatus.CONFLICT,
			"CONFLICT",
			"CONSTRAINT_VIOLATION",
			"Conflict with existing resource."
		);
	}

	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public ProblemDetail handleUnexpected(Exception exception) {
		LOGGER.error("Unexpected API error", exception);
		return problem(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"INTERNAL_ERROR",
			"UNEXPECTED_ERROR",
			"An unexpected error occurred."
		);
	}

	private ProblemDetail problem(HttpStatusCode status, String code, String subCode, String detail) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
		problem.setTitle(code);
		problem.setProperty("code", code);
		problem.setProperty("subCode", subCode);
		return problem;
	}

	private String formatFieldError(FieldError fieldError) {
		String defaultMessage = fieldError.getDefaultMessage() == null ? "invalid value" : fieldError.getDefaultMessage();
		return fieldError.getField() + ": " + defaultMessage;
	}
}
