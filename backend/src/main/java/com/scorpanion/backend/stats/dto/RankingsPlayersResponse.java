package com.scorpanion.backend.stats.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RankingsPlayersResponse(
	String metric,
	Filters filters,
	Paging paging,
	List<Row> rows
) {

	public record Filters(Instant from, Instant to, UUID gameId) {
	}

	public record Paging(int limit, int offset, long total) {
	}

	public record Row(
		Integer rank,
		PlayerInfo player,
		Long value,
		boolean hasValue,
		long winCount,
		long participationCount
	) {
	}

	public record PlayerInfo(UUID id, String name) {
	}
}


