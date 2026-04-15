package com.scorpanion.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.List;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ProblemDetail handleMethodArgumentNotValid(MethodArgumentNotValidException exception) {
		ProblemDetail problem = problem(
			HttpStatus.BAD_REQUEST,
			"INVALID_REQUEST",
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
		return problem(
			HttpStatus.BAD_REQUEST,
			"INVALID_REQUEST",
			exception.getMessage()
		);
	}

	@ExceptionHandler({
		InvalidGameSessionException.class,
		IllegalArgumentException.class
	})
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ProblemDetail handleBadRequest(RuntimeException exception) {
		return problem(
			HttpStatus.BAD_REQUEST,
			"INVALID_REQUEST",
			exception.getMessage()
		);
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ProblemDetail handleNotFound(ResourceNotFoundException exception) {
		return problem(
			HttpStatus.NOT_FOUND,
			"RESOURCE_NOT_FOUND",
			exception.getMessage()
		);
	}

	@ExceptionHandler({
		DuplicateNameException.class,
		DuplicatePlayerInSessionException.class,
		DataIntegrityViolationException.class
	})
	@ResponseStatus(HttpStatus.CONFLICT)
	public ProblemDetail handleConflict(Exception exception) {
		return problem(
			HttpStatus.CONFLICT,
			"CONFLICT",
			exception.getMessage()
		);
	}

	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public ProblemDetail handleUnexpected(Exception exception) {
		return problem(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"INTERNAL_ERROR",
			"An unexpected error occurred."
		);
	}

	private ProblemDetail problem(HttpStatusCode status, String code, String detail) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
		problem.setTitle(code);
		problem.setProperty("code", code);
		return problem;
	}

	private String formatFieldError(FieldError fieldError) {
		String defaultMessage = fieldError.getDefaultMessage() == null ? "invalid value" : fieldError.getDefaultMessage();
		return fieldError.getField() + ": " + defaultMessage;
	}
}
