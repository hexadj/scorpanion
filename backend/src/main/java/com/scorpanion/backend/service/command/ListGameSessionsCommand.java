package com.scorpanion.backend.service.command;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

public record ListGameSessionsCommand(
	List<UUID> gameIds,
	List<UUID> playerIds,
	int limit,
	String cursor
) {

	public ListGameSessionsCommand {
		gameIds = gameIds == null
			? List.of()
			: gameIds.stream()
				.filter(Objects::nonNull)
				.distinct()
				.toList();

		playerIds = playerIds == null
			? List.of()
			: playerIds.stream()
				.filter(Objects::nonNull)
				.distinct()
				.toList();

		cursor = cursor == null || cursor.isBlank() ? null : cursor;
	}
}
