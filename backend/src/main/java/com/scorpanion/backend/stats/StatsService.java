package com.scorpanion.backend.stats;

import java.time.Instant;
import java.util.UUID;

import com.scorpanion.backend.stats.dto.CatalogResponse;
import com.scorpanion.backend.stats.dto.DistributionGamesResponse;
import com.scorpanion.backend.stats.dto.DistributionParticipationsResponse;
import com.scorpanion.backend.stats.dto.DistributionScoresResponse;
import com.scorpanion.backend.stats.dto.DistributionWinsResponse;
import com.scorpanion.backend.stats.dto.RankingsPlayersResponse;
import com.scorpanion.backend.stats.dto.TimeseriesResponse;

public interface StatsService {

	CatalogResponse getCatalog();

	TimeseriesResponse getTimeseries(
		String metric,
		String scope,
		String interval,
		Instant from,
		Instant to,
		UUID playerId,
		UUID gameId
	);

	RankingsPlayersResponse getRankingsPlayers(
		String metric,
		Instant from,
		Instant to,
		UUID gameId,
		int limit,
		int offset
	);

	DistributionGamesResponse getDistributionGames(
		String scope,
		UUID playerId,
		Instant from,
		Instant to,
		int limit,
		boolean includeOthers
	);

	DistributionScoresResponse getDistributionScores(
		String scope,
		UUID playerId,
		UUID gameId,
		Instant from,
		Instant to,
		int limit,
		boolean includeOthers
	);

	DistributionWinsResponse getDistributionWins(
		String scope,
		UUID gameId,
		Instant from,
		Instant to
	);

	DistributionParticipationsResponse getDistributionParticipations(
		String scope,
		UUID gameId,
		Instant from,
		Instant to
	);
}


