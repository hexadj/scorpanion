package com.scorpanion.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreateGameSessionRequest(
	@NotNull
	UUID gameId,
	@NotNull
	Instant playedAt,
	@NotNull
	@Size(min = 1)
	List<@NotNull @Valid SessionPlayerResultRequest> playerResults
) {
}
