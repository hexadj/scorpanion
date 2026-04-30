package com.scorpanion.backend.stats.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DistributionParticipationsResponse(
	String scope,
	Filters filters,
	long totalPlayerCount,
	List<Row> rows
) {

	public record Filters(UUID gameId, Instant from, Instant to) {
	}

	public record Row(BucketInfo bucket, long count, int share) {
	}

	public record BucketInfo(String id, String label) {
	}
}
