package com.scorpanion.backend.stats.service.query;

import java.time.Instant;
import java.util.UUID;

import com.scorpanion.backend.stats.model.Scope;

public record DistributionGamesQuery(
	Scope scope,
	UUID playerId,
	Instant from,
	Instant to,
	int limit,
	boolean includeOthers
) {
}
