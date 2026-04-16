package com.scorpanion.backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record GameSessionResponse(
	UUID id,
	UUID gameId,
	Instant playedAt,
	List<SessionPlayerResultResponse> playerResults
) {

	public GameSessionResponse {
		playerResults = playerResults == null ? List.of() : List.copyOf(playerResults);
	}
}
