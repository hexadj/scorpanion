package com.scorpanion.backend.stats.dto;

import java.time.Instant;
import java.util.UUID;

import com.scorpanion.backend.stats.model.Interval;
import com.scorpanion.backend.stats.model.Metric;
import com.scorpanion.backend.stats.model.Scope;

public record TimeseriesQuery(
	Metric metric,
	Scope scope,
	Interval interval,
	Instant from,
	Instant to,
	UUID playerId,
	UUID gameId
) {
}


