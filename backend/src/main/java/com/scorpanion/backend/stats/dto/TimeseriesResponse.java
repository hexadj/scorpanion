package com.scorpanion.backend.stats.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TimeseriesResponse(
	String metric,
	String scope,
	String interval,
	Filters filters,
	List<Point> series,
	Instant generatedAt
) {

	public record Filters(Instant from, Instant to, UUID playerId, UUID gameId) {
	}

	public record Point(Instant bucketStart, Long value, Long sampleSize) {
	}
}


