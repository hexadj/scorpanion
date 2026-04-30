package com.scorpanion.backend.stats;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import com.scorpanion.backend.stats.model.Interval;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.scorpanion.backend.stats.dto.CatalogResponse;
import com.scorpanion.backend.stats.dto.DistributionGamesResponse;
import com.scorpanion.backend.stats.dto.DistributionParticipationsResponse;
import com.scorpanion.backend.stats.dto.DistributionScoresResponse;
import com.scorpanion.backend.stats.dto.DistributionWinsResponse;
import com.scorpanion.backend.stats.dto.RankingsPlayersResponse;
import com.scorpanion.backend.stats.dto.TimeseriesResponse;
import com.scorpanion.backend.stats.repository.StatsDistributionRepository;
import com.scorpanion.backend.stats.repository.StatsRankingsRepository;
import com.scorpanion.backend.stats.repository.StatsTimeseriesRepository;
import com.scorpanion.backend.stats.algorithm.CompetitionRanking;
import com.scorpanion.backend.stats.algorithm.HamiltonAlgorithm;
import com.scorpanion.backend.stats.algorithm.ScoreBucketing;
import com.scorpanion.backend.stats.dto.DistributionGamesQuery;
import com.scorpanion.backend.stats.dto.DistributionParticipationsQuery;
import com.scorpanion.backend.stats.dto.DistributionScoresQuery;
import com.scorpanion.backend.stats.dto.DistributionWinsQuery;
import com.scorpanion.backend.stats.dto.RankingsPlayersQuery;
import com.scorpanion.backend.stats.dto.TimeseriesQuery;

@Service
public class StatsServiceImpl implements StatsService {

	private final StatsQueryValidator validator;
	private final StatsTimeseriesRepository timeseriesRepository;
	private final StatsRankingsRepository rankingsRepository;
	private final StatsDistributionRepository distributionRepository;

	public StatsServiceImpl(
		StatsQueryValidator validator,
		StatsTimeseriesRepository timeseriesRepository,
		StatsRankingsRepository rankingsRepository,
		StatsDistributionRepository distributionRepository
	) {
		this.validator = validator;
		this.timeseriesRepository = timeseriesRepository;
		this.rankingsRepository = rankingsRepository;
		this.distributionRepository = distributionRepository;
	}

	// -------------------------------------------------------------------------
	// Catalog
	// -------------------------------------------------------------------------

	@Override
	public CatalogResponse getCatalog() {
		return new CatalogResponse(
			Arrays.stream(Interval.values()).map(Interval::getValue).toList(),
			List.of("global", "player", "game"),
			List.of(
				new CatalogResponse.MetricInfo("sessionCount", "Parties jouées",
					"Nombre total de parties dans le périmètre filtré.",
					List.of("timeseries", "distributions"), List.of()),
				new CatalogResponse.MetricInfo("participationCount", "Participations",
					"Nombre de participations d'un joueur.",
					List.of("timeseries", "rankings"), List.of()),
				new CatalogResponse.MetricInfo("winCount", "Victoires",
					"Nombre de parties où le joueur est marqué gagnant.",
					List.of("timeseries", "rankings"), List.of()),
				new CatalogResponse.MetricInfo("winRate", "Winrate",
					"Taux de victoire d'un joueur (winCount / participationCount).",
					List.of("timeseries", "rankings"), List.of()),
				new CatalogResponse.MetricInfo("averageScore", "Score moyen",
					"Moyenne des scores renseignés.",
					List.of("timeseries", "rankings"), List.of("NO_SCORE_UNSUPPORTED", "REQUIRES_GAME_CONTEXT")),
				new CatalogResponse.MetricInfo("minScore", "Score minimum",
					"Score minimum observé sur les entrées avec score.",
					List.of("timeseries"), List.of("NO_SCORE_UNSUPPORTED", "REQUIRES_GAME_CONTEXT")),
				new CatalogResponse.MetricInfo("maxScore", "Score maximum",
					"Score maximum observé sur les entrées avec score.",
					List.of("timeseries"), List.of("NO_SCORE_UNSUPPORTED", "REQUIRES_GAME_CONTEXT")),
				new CatalogResponse.MetricInfo("averageRank", "Rang moyen",
					"Rang moyen calculé uniquement sur les entrées avec rank renseigné.",
					List.of("timeseries", "rankings"), List.of()),
				new CatalogResponse.MetricInfo("playedGameCount", "Jeux joués",
					"Nombre de jeux distincts joués dans le périmètre.",
					List.of("timeseries"), List.of()),
				new CatalogResponse.MetricInfo("activePlayerCount", "Joueurs actifs",
					"Nombre de joueurs distincts ayant participé dans le périmètre.",
					List.of("timeseries"), List.of())
			)
		);
	}

	// -------------------------------------------------------------------------
	// Timeseries
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public TimeseriesResponse getTimeseries(
		String metric, String scope, String interval,
		Instant from, Instant to, UUID playerId, UUID gameId
	) {
		TimeseriesQuery query = validator.validateTimeseries(metric, scope, interval, from, to, playerId, gameId);

		List<StatsTimeseriesRepository.TimeseriesPoint> points = timeseriesRepository.findTimeseries(
			query.metric(), query.scope(), query.interval(),
			query.from(), query.to(), query.playerId(), query.gameId()
		);

		return new TimeseriesResponse(
			query.metric().getValue(),
			query.scope().getValue(),
			query.interval().getValue(),
			new TimeseriesResponse.Filters(query.from(), query.to(), query.playerId(), query.gameId()),
			points.stream()
				.map(p -> new TimeseriesResponse.Point(p.bucketStart(), p.value(), p.sampleSize()))
				.toList(),
			Instant.now()
		);
	}

	// -------------------------------------------------------------------------
	// Rankings players
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public RankingsPlayersResponse getRankingsPlayers(
		String metric, Instant from, Instant to, UUID gameId, int limit, int offset
	) {
		RankingsPlayersQuery query = validator.validateRankingsPlayers(metric, from, to, gameId, limit, offset);

		List<StatsRankingsRepository.RankingRowRaw> rawRows = rankingsRepository.findRankingsPlayers(
			query.metric(), query.from(), query.to(), query.gameId(), query.limit(), query.offset()
		);
		long total = rankingsRepository.countRankingsPlayers(query.from(), query.to(), query.gameId());

		List<Integer> ranks = CompetitionRanking.rank(rawRows, StatsRankingsRepository.RankingRowRaw::metricValue);

		List<RankingsPlayersResponse.Row> rows = new ArrayList<>(rawRows.size());
		for (int i = 0; i < rawRows.size(); i++) {
			StatsRankingsRepository.RankingRowRaw raw = rawRows.get(i);
			rows.add(new RankingsPlayersResponse.Row(
				ranks.get(i),
				new RankingsPlayersResponse.PlayerInfo(raw.playerId(), raw.playerName()),
				raw.metricValue(),
				raw.metricValue() != null,
				raw.winCount(),
				raw.participationCount()
			));
		}

		return new RankingsPlayersResponse(
			query.metric().getValue(),
			new RankingsPlayersResponse.Filters(query.from(), query.to(), query.gameId()),
			new RankingsPlayersResponse.Paging(query.limit(), query.offset(), total),
			rows
		);
	}

	// -------------------------------------------------------------------------
	// Distribution games
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public DistributionGamesResponse getDistributionGames(
		String scope, UUID playerId, Instant from, Instant to, int limit, boolean includeOthers
	) {
		DistributionGamesQuery query = validator.validateDistributionGames(scope, playerId, from, to, limit, includeOthers);

		List<StatsDistributionRepository.GameDistributionRowRaw> rawRows =
			distributionRepository.findDistributionGames(
				query.scope(), query.playerId(), query.from(), query.to(), query.limit() + 1
			);

		if (rawRows.isEmpty()) {
			return new DistributionGamesResponse(
				query.scope().getValue(),
				new DistributionGamesResponse.Filters(query.playerId(), query.from(), query.to()),
				0L, List.of()
			);
		}

		long totalSessionCount = rawRows.get(0).totalSessionCount();
		boolean hasMore = rawRows.size() > query.limit();
		List<StatsDistributionRepository.GameDistributionRowRaw> pageRows =
			hasMore ? rawRows.subList(0, query.limit()) : rawRows;

		return new DistributionGamesResponse(
			query.scope().getValue(),
			new DistributionGamesResponse.Filters(query.playerId(), query.from(), query.to()),
			totalSessionCount,
			buildGameDistributionRows(pageRows, hasMore && query.includeOthers(), totalSessionCount)
		);
	}

	private List<DistributionGamesResponse.Row> buildGameDistributionRows(
		List<StatsDistributionRepository.GameDistributionRowRaw> pageRows,
		boolean addOthers,
		long totalSessionCount
	) {
		long othersCount = totalSessionCount - pageRows.stream().mapToLong(StatsDistributionRepository.GameDistributionRowRaw::sessionCount).sum();

		List<Double> rawShares = new ArrayList<>();
		for (var raw : pageRows) {
			rawShares.add(rawShare(raw.sessionCount(), totalSessionCount));
		}
		if (addOthers) {
			rawShares.add(rawShare(othersCount, totalSessionCount));
		}

		List<Integer> shares = HamiltonAlgorithm.allocate(rawShares);

		List<DistributionGamesResponse.Row> rows = new ArrayList<>();
		for (int i = 0; i < pageRows.size(); i++) {
			var raw = pageRows.get(i);
			rows.add(new DistributionGamesResponse.Row(
				new DistributionGamesResponse.GameInfo(raw.gameId(), raw.gameName(), raw.resultType()),
				false, raw.sessionCount(), shares.get(i)
			));
		}
		if (addOthers) {
			rows.add(new DistributionGamesResponse.Row(null, true, othersCount, shares.get(shares.size() - 1)));
		}
		return rows;
	}

	// -------------------------------------------------------------------------
	// Distribution scores
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public DistributionScoresResponse getDistributionScores(
		String scope, UUID playerId, UUID gameId, Instant from, Instant to, int limit, boolean includeOthers
	) {
		DistributionScoresQuery query = validator.validateDistributionScores(scope, playerId, gameId, from, to, limit, includeOthers);

		StatsDistributionRepository.ScoreRangeRaw range =
			distributionRepository.findScoreRange(query.scope(), query.playerId(), query.gameId(), query.from(), query.to());

		if (range == null || range.sampleSize() == 0) {
			return new DistributionScoresResponse(
				query.scope().getValue(),
				new DistributionScoresResponse.Filters(query.playerId(), query.gameId(), query.from(), query.to()),
				0L, List.of()
			);
		}

		List<ScoreBucketing.ScoreBucket> buckets = ScoreBucketing.compute(range.min(), range.max());
		List<StatsDistributionRepository.ScoreDistributionRowRaw> rawRows =
			distributionRepository.findDistributionScores(
				query.scope(), query.playerId(), query.gameId(), query.from(), query.to(), buckets
			);

		Map<Integer, Long> countByLower = new HashMap<>();
		for (var row : rawRows) {
			countByLower.put(row.lowerBound(), row.count());
		}

		long totalSampleSize = range.sampleSize();
		boolean hasMore = buckets.size() > query.limit();
		List<ScoreBucketing.ScoreBucket> pageBuckets = hasMore ? buckets.subList(0, query.limit()) : buckets;

		List<Double> rawShares = new ArrayList<>();
		for (var bucket : pageBuckets) {
			rawShares.add(rawShare(countByLower.getOrDefault(bucket.lowerInclusive(), 0L), totalSampleSize));
		}
		long othersCount = 0;
		if (hasMore && query.includeOthers()) {
			for (int i = query.limit(); i < buckets.size(); i++) {
				othersCount += countByLower.getOrDefault(buckets.get(i).lowerInclusive(), 0L);
			}
			rawShares.add(rawShare(othersCount, totalSampleSize));
		}

		List<Integer> shares = HamiltonAlgorithm.allocate(rawShares);

		List<DistributionScoresResponse.Row> rows = new ArrayList<>();
		for (int i = 0; i < pageBuckets.size(); i++) {
			var bucket = pageBuckets.get(i);
			long count = countByLower.getOrDefault(bucket.lowerInclusive(), 0L);
			rows.add(new DistributionScoresResponse.Row(
				new DistributionScoresResponse.BucketInfo(bucket.lowerInclusive(), bucket.upperExclusive(), bucket.label()),
				false, count, shares.get(i)
			));
		}
		if (hasMore && query.includeOthers()) {
			rows.add(new DistributionScoresResponse.Row(null, true, othersCount, shares.get(shares.size() - 1)));
		}

		return new DistributionScoresResponse(
			query.scope().getValue(),
			new DistributionScoresResponse.Filters(query.playerId(), query.gameId(), query.from(), query.to()),
			totalSampleSize, rows
		);
	}

	// -------------------------------------------------------------------------
	// Distribution wins
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public DistributionWinsResponse getDistributionWins(String scope, UUID gameId, Instant from, Instant to) {
		DistributionWinsQuery query = validator.validateDistributionWins(scope, gameId, from, to);

		long totalPlayerCount = distributionRepository.countActivePlayersForWins(
			query.scope(), query.gameId(), query.from(), query.to()
		);

		if (totalPlayerCount == 0) {
			return new DistributionWinsResponse(
				query.scope().getValue(),
				new DistributionWinsResponse.Filters(query.gameId(), query.from(), query.to()),
				0L, List.of()
			);
		}

		Map<String, Long> bucketCounts = distributionRepository.findDistributionWins(
			query.scope(), query.gameId(), query.from(), query.to()
		);

		List<Map.Entry<String, String>> bucketDefs = List.of(
			Map.entry("0", "0 victoire"),
			Map.entry("1", "1 victoire"),
			Map.entry("2", "2 victoires"),
			Map.entry("3_PLUS", "3+ victoires")
		);
		List<Integer> shares = HamiltonAlgorithm.allocate(
			bucketDefs.stream()
				.map(e -> rawShare(bucketCounts.getOrDefault(e.getKey(), 0L), totalPlayerCount))
				.toList()
		);

		List<DistributionWinsResponse.Row> rows = new ArrayList<>();
		for (int i = 0; i < bucketDefs.size(); i++) {
			var def = bucketDefs.get(i);
			rows.add(new DistributionWinsResponse.Row(
				new DistributionWinsResponse.BucketInfo(def.getKey(), def.getValue()),
				bucketCounts.getOrDefault(def.getKey(), 0L),
				shares.get(i)
			));
		}

		return new DistributionWinsResponse(
			query.scope().getValue(),
			new DistributionWinsResponse.Filters(query.gameId(), query.from(), query.to()),
			totalPlayerCount, rows
		);
	}

	// -------------------------------------------------------------------------
	// Distribution participations
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public DistributionParticipationsResponse getDistributionParticipations(String scope, UUID gameId, Instant from, Instant to) {
		DistributionParticipationsQuery query = validator.validateDistributionParticipations(scope, gameId, from, to);

		long totalPlayerCount = distributionRepository.countActivePlayersForParticipations(
			query.scope(), query.gameId(), query.from(), query.to()
		);

		if (totalPlayerCount == 0) {
			return new DistributionParticipationsResponse(
				query.scope().getValue(),
				new DistributionParticipationsResponse.Filters(query.gameId(), query.from(), query.to()),
				0L, List.of()
			);
		}

		Map<String, Long> bucketCounts = distributionRepository.findDistributionParticipations(
			query.scope(), query.gameId(), query.from(), query.to()
		);

		List<Map.Entry<String, String>> bucketDefs = List.of(
			Map.entry("1", "1 participation"),
			Map.entry("2_3", "2-3 participations"),
			Map.entry("4_6", "4-6 participations"),
			Map.entry("7_PLUS", "7+ participations")
		);
		List<Integer> shares = HamiltonAlgorithm.allocate(
			bucketDefs.stream()
				.map(e -> rawShare(bucketCounts.getOrDefault(e.getKey(), 0L), totalPlayerCount))
				.toList()
		);

		List<DistributionParticipationsResponse.Row> rows = new ArrayList<>();
		for (int i = 0; i < bucketDefs.size(); i++) {
			var def = bucketDefs.get(i);
			rows.add(new DistributionParticipationsResponse.Row(
				new DistributionParticipationsResponse.BucketInfo(def.getKey(), def.getValue()),
				bucketCounts.getOrDefault(def.getKey(), 0L),
				shares.get(i)
			));
		}

		return new DistributionParticipationsResponse(
			query.scope().getValue(),
			new DistributionParticipationsResponse.Filters(query.gameId(), query.from(), query.to()),
			totalPlayerCount, rows
		);
	}

	// -------------------------------------------------------------------------
	// Shared helpers
	// -------------------------------------------------------------------------

	private static double rawShare(long count, long total) {
		return total > 0 ? count * 100.0 / total : 0.0;
	}
}


