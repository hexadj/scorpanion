package com.scorpanion.backend.session.dto;

import java.util.UUID;

public record SessionPlayerResultResponse(
	UUID id,
	UUID playerId,
	String playerName,
	Integer score,
	Integer rank,
	boolean isWinner
) {
}


