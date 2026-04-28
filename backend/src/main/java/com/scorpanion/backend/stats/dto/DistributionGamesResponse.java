package com.scorpanion.backend.stats.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DistributionGamesResponse(
	String scope,
	Filters filters,
	long totalSessionCount,
	List<Row> rows
) {

	public record Filters(UUID playerId, Instant from, Instant to) {
	}

	public record Row(GameInfo game, boolean isOthers, long sessionCount, int share) {
	}

	public record GameInfo(UUID id, String name, String resultType) {
	}
}
