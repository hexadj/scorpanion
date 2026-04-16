package com.scorpanion.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePlayerRequest(
	@NotBlank
	@Size(max = 120)
	String name
) {
}
