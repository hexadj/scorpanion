package com.scorpanion.backend.repository;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface GameSessionHistoryRepository {

	List<UUID> findHistoryPageIds(
		Set<UUID> gameIds,
		Set<UUID> playerIds,
		Instant cursorPlayedAt,
		UUID cursorId,
		int limitPlusOne
	);
}
