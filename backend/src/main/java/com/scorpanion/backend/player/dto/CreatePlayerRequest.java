package com.scorpanion.backend.player.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePlayerRequest(
	@NotBlank
	@Size(max = 120)
	String name
) {
}


