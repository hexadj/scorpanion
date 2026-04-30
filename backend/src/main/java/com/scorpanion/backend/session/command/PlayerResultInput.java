package com.scorpanion.backend.session.command;

import java.util.UUID;

public record PlayerResultInput(
	UUID playerId,
	Integer score,
	Integer rank,
	boolean isWinner
) {
}


