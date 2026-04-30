package com.scorpanion.backend.stats.dto;

import java.time.Instant;
import java.util.UUID;

import com.scorpanion.backend.stats.model.Scope;

public record DistributionWinsQuery(
	Scope scope,
	UUID gameId,
	Instant from,
	Instant to
) {
}


