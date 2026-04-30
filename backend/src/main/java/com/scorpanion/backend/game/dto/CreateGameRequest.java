package com.scorpanion.backend.game.dto;

import com.scorpanion.backend.model.ResultType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateGameRequest(
	@NotBlank
	@Size(max = 120)
	String name,

	@NotNull
	ResultType resultType
) {
}


