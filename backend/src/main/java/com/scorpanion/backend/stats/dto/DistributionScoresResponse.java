package com.scorpanion.backend.stats.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DistributionScoresResponse(
	String scope,
	Filters filters,
	long totalSampleSize,
	List<Row> rows
) {

	public record Filters(UUID playerId, UUID gameId, Instant from, Instant to) {
	}

	public record Row(BucketInfo bucket, boolean isOthers, long count, int share) {
	}

	public record BucketInfo(int lowerInclusive, int upperExclusive, String label) {
	}
}
