package com.scorpanion.backend.session.command;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreateGameSessionCommand(
	UUID gameId,
	Instant playedAt,
	List<PlayerResultInput> playerResults
) {

	public CreateGameSessionCommand {
		playerResults = playerResults == null ? List.of() : List.copyOf(playerResults);
	}
}


