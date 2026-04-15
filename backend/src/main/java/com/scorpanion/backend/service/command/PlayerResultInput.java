package com.scorpanion.backend.service.command;

import java.util.UUID;

public record PlayerResultInput(
	UUID playerId,
	Integer score,
	Integer rank,
	Boolean isWinner
) {
}
