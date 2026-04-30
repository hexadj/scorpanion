package com.scorpanion.backend.session.dto;

import com.scorpanion.backend.model.ResultType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record GameSessionResponse(
	UUID id,
	UUID gameId,
	String gameName,
	ResultType resultType,
	Instant playedAt,
	List<SessionPlayerResultResponse> playerResults
) {

	public GameSessionResponse {
		playerResults = playerResults == null ? List.of() : List.copyOf(playerResults);
	}
}


