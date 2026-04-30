package com.scorpanion.backend.stats.dto;

import java.time.Instant;
import java.util.UUID;

import com.scorpanion.backend.stats.model.Metric;

public record RankingsPlayersQuery(
	Metric metric,
	Instant from,
	Instant to,
	UUID gameId,
	int limit,
	int offset
) {
}


