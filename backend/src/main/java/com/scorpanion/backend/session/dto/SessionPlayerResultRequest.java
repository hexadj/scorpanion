package com.scorpanion.backend.session.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SessionPlayerResultRequest(
	@NotNull
	UUID playerId,
	Integer score,
	Integer rank,
	@NotNull
	Boolean isWinner
) {
}


