package com.scorpanion.backend.dto;

import java.util.UUID;

public record SessionPlayerResultResponse(
	UUID id,
	UUID playerId,
	Integer score,
	Integer rank,
	boolean isWinner
) {
}
