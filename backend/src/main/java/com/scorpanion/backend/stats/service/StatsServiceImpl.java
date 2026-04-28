package com.scorpanion.backend.stats.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.scorpanion.backend.exception.ResourceNotFoundException;
import com.scorpanion.backend.model.ResultType;
import com.scorpanion.backend.repository.GameRepository;
import com.scorpanion.backend.repository.PlayerRepository;
import com.scorpanion.backend.stats.dto.CatalogResponse;
import com.scorpanion.backend.stats.dto.DistributionGamesResponse;
import com.scorpanion.backend.stats.dto.DistributionParticipationsResponse;
import com.scorpanion.backend.stats.dto.DistributionScoresResponse;
import com.scorpanion.backend.stats.dto.DistributionWinsResponse;
import com.scorpanion.backend.stats.dto.RankingsPlayersResponse;
import com.scorpanion.backend.stats.dto.TimeseriesResponse;
import com.scorpanion.backend.stats.exception.StatsValidationException;
import com.scorpanion.backend.stats.model.Interval;
import com.scorpanion.backend.stats.model.Metric;
import com.scorpanion.backend.stats.model.Scope;
import com.scorpanion.backend.stats.repository.StatsDistributionRepository;
import com.scorpanion.backend.stats.repository.StatsRankingsRepository;
import com.scorpanion.backend.stats.repository.StatsTimeseriesRepository;
import com.scorpanion.backend.stats.service.internal.CompetitionRanking;
import com.scorpanion.backend.stats.service.internal.HamiltonAlgorithm;
import com.scorpanion.backend.stats.service.internal.ScoreBucketing;

@Service
public class StatsServiceImpl implements StatsService {

	private static final int MAX_WEEK_BUCKETS = 260;
	private static final int MAX_MONTH_BUCKETS = 120;

	private final GameRepository gameRepository;
	private final PlayerRepository playerRepository;
	private final StatsTimeseriesRepository timeseriesRepository;
	private final StatsRankingsRepository rankingsRepository;
	private final StatsDistributionRepository distributionRepository;

	public StatsServiceImpl(
		GameRepository gameRepository,
		PlayerRepository playerRepository,
		StatsTimeseriesRepository timeseriesRepository,
		StatsRankingsRepository rankingsRepository,
		StatsDistributionRepository distributionRepository
	) {
		this.gameRepository = gameRepository;
		this.playerRepository = playerRepository;
		this.timeseriesRepository = timeseriesRepository;
		this.rankingsRepository = rankingsRepository;
		this.distributionRepository = distributionRepository;
	}

	// -------------------------------------------------------------------------
	// Catalog
	// -------------------------------------------------------------------------

	@Override
	public CatalogResponse getCatalog() {
		List<String> supportedIntervals = List.of("week", "month");
		List<String> supportedScopes = List.of("global", "player", "game");

		List<CatalogResponse.MetricInfo> metrics = List.of(
			new CatalogResponse.MetricInfo(
				"sessionCount", "Parties jouées",
				"Nombre total de parties dans le périmètre filtré.",
				List.of("timeseries", "distributions"), List.of()
			),
			new CatalogResponse.MetricInfo(
				"participationCount", "Participations",
				"Nombre de participations d'un joueur.",
				List.of("timeseries", "rankings"), List.of()
			),
			new CatalogResponse.MetricInfo(
				"winCount", "Victoires",
				"Nombre de parties où le joueur est marqué gagnant.",
				List.of("timeseries", "rankings"), List.of()
			),
			new CatalogResponse.MetricInfo(
				"winRate", "Winrate",
				"Taux de victoire d'un joueur (winCount / participationCount).",
				List.of("timeseries", "rankings"), List.of()
			),
			new CatalogResponse.MetricInfo(
				"averageScore", "Score moyen",
				"Moyenne des scores renseignés.",
				List.of("timeseries", "rankings"), List.of("NO_SCORE_UNSUPPORTED", "REQUIRES_GAME_CONTEXT")
			),
			new CatalogResponse.MetricInfo(
				"minScore", "Score minimum",
				"Score minimum observé sur les entrées avec score.",
				List.of("timeseries"), List.of("NO_SCORE_UNSUPPORTED", "REQUIRES_GAME_CONTEXT")
			),
			new CatalogResponse.MetricInfo(
				"maxScore", "Score maximum",
				"Score maximum observé sur les entrées avec score.",
				List.of("timeseries"), List.of("NO_SCORE_UNSUPPORTED", "REQUIRES_GAME_CONTEXT")
			),
			new CatalogResponse.MetricInfo(
				"averageRank", "Rang moyen",
				"Rang moyen calculé uniquement sur les entrées avec rank renseigné.",
				List.of("timeseries", "rankings"), List.of()
			),
			new CatalogResponse.MetricInfo(
				"playedGameCount", "Jeux joués",
				"Nombre de jeux distincts joués dans le périmètre.",
				List.of("timeseries"), List.of()
			),
			new CatalogResponse.MetricInfo(
				"activePlayerCount", "Joueurs actifs",
				"Nombre de joueurs distincts ayant participé dans le périmètre.",
				List.of("timeseries"), List.of()
			)
		);

		return new CatalogResponse(supportedIntervals, supportedScopes, metrics);
	}

	// -------------------------------------------------------------------------
	// Timeseries
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public TimeseriesResponse getTimeseries(
		String metricStr,
		String scopeStr,
		String intervalStr,
		Instant from,
		Instant to,
		UUID playerId,
		UUID gameId
	) {
		Metric metric = parseMetric(metricStr);
		Scope scope = parseScope(scopeStr);
		Interval interval = parseInterval(intervalStr);

		validateTimeseriesMatrix(metric, scope);

		Instant resolvedTo = to != null ? to : Instant.now();
		Instant resolvedFrom = from != null ? from : resolvedTo.minus(365, ChronoUnit.DAYS);
		validateTimeRange(resolvedFrom, resolvedTo);
		validateBucketCount(resolvedFrom, resolvedTo, interval);

		if (scope == Scope.PLAYER || (scope == Scope.GAME && List.of(Metric.AVERAGE_SCORE, Metric.MIN_SCORE, Metric.MAX_SCORE).contains(metric))) {
			if (playerId != null) {
				resolvePlayer(playerId);
			}
		}
		if (gameId != null) {
			var game = resolveGame(gameId);
			if (isScoreMetric(metric) && game.getResultType() == ResultType.NO_SCORE) {
				throw new StatsValidationException("NO_SCORE_UNSUPPORTED",
					"This metric is not supported for NO_SCORE games.");
			}
		}

		validateTimeseriesRequiredFilters(metric, scope, playerId, gameId);

		List<StatsTimeseriesRepository.TimeseriesPoint> points = timeseriesRepository.findTimeseries(
			metric, scope, interval, resolvedFrom, resolvedTo, playerId, gameId
		);

		List<TimeseriesResponse.Point> series = points.stream()
			.map(p -> new TimeseriesResponse.Point(p.bucketStart(), p.value(), p.sampleSize()))
			.toList();

		return new TimeseriesResponse(
			metric.getValue(),
			scope.getValue(),
			interval.getValue(),
			new TimeseriesResponse.Filters(resolvedFrom, resolvedTo, playerId, gameId),
			series,
			Instant.now()
		);
	}

	private void validateTimeseriesMatrix(Metric metric, Scope scope) {
		boolean valid = switch (metric) {
			case SESSION_COUNT -> scope == Scope.GLOBAL || scope == Scope.PLAYER || scope == Scope.GAME;
			case PARTICIPATION_COUNT, WIN_COUNT, WIN_RATE, AVERAGE_RANK -> scope == Scope.PLAYER;
			case AVERAGE_SCORE, MIN_SCORE, MAX_SCORE -> scope == Scope.PLAYER || scope == Scope.GAME;
			case PLAYED_GAME_COUNT -> scope == Scope.GLOBAL || scope == Scope.PLAYER;
			case ACTIVE_PLAYER_COUNT -> scope == Scope.GLOBAL || scope == Scope.GAME;
		};
		if (!valid) {
			throw new StatsValidationException("UNSUPPORTED_METRIC_SCOPE_COMBINATION",
				"Metric '" + metric.getValue() + "' is not supported for scope '" + scope.getValue() + "'.");
		}
	}

	private void validateTimeseriesRequiredFilters(Metric metric, Scope scope, UUID playerId, UUID gameId) {
		if (scope == Scope.PLAYER && playerId == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER",
				"playerId is required for scope=player.");
		}
		if (scope == Scope.GAME && gameId == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER",
				"gameId is required for scope=game.");
		}
		if (isScoreMetric(metric) && gameId == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER",
				"gameId is required for score metrics.");
		}
	}

	// -------------------------------------------------------------------------
	// Rankings players
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public RankingsPlayersResponse getRankingsPlayers(
		String metricStr,
		Instant from,
		Instant to,
		UUID gameId,
		int limit,
		int offset
	) {
		Metric metric = parseMetric(metricStr);
		validateRankingMetric(metric);

		if (limit < 1 || limit > 100) {
			throw new StatsValidationException("INVALID_LIMIT", "limit must be between 1 and 100.");
		}
		if (offset < 0) {
			throw new StatsValidationException("INVALID_OFFSET", "offset must be >= 0.");
		}

		Instant resolvedTo = to != null ? to : Instant.now();
		Instant resolvedFrom = from != null ? from : resolvedTo.minus(365, ChronoUnit.DAYS);
		validateTimeRange(resolvedFrom, resolvedTo);

		if (gameId != null) {
			var game = resolveGame(gameId);
			if (metric == Metric.AVERAGE_SCORE && game.getResultType() == ResultType.NO_SCORE) {
				throw new StatsValidationException("NO_SCORE_UNSUPPORTED",
					"averageScore ranking is not supported for NO_SCORE games.");
			}
		}
		if (metric == Metric.AVERAGE_SCORE && gameId == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER",
				"gameId is required for averageScore ranking.");
		}

		List<StatsRankingsRepository.RankingRowRaw> rawRows = rankingsRepository.findRankingsPlayers(
			metric, resolvedFrom, resolvedTo, gameId, limit, offset
		);
		long total = rankingsRepository.countRankingsPlayers(resolvedFrom, resolvedTo, gameId);

		List<Long> values = rawRows.stream().map(StatsRankingsRepository.RankingRowRaw::metricValue).toList();
		List<Integer> ranks = CompetitionRanking.rank(rawRows, StatsRankingsRepository.RankingRowRaw::metricValue);

		List<RankingsPlayersResponse.Row> rows = new ArrayList<>(rawRows.size());
		for (int i = 0; i < rawRows.size(); i++) {
			StatsRankingsRepository.RankingRowRaw raw = rawRows.get(i);
			Long value = values.get(i);
			rows.add(new RankingsPlayersResponse.Row(
				ranks.get(i),
				new RankingsPlayersResponse.PlayerInfo(raw.playerId(), raw.playerName()),
				value,
				value != null,
				raw.winCount(),
				raw.participationCount()
			));
		}

		return new RankingsPlayersResponse(
			metric.getValue(),
			new RankingsPlayersResponse.Filters(resolvedFrom, resolvedTo, gameId),
			new RankingsPlayersResponse.Paging(limit, offset, total),
			rows
		);
	}

	private void validateRankingMetric(Metric metric) {
		boolean valid = switch (metric) {
			case WIN_RATE, WIN_COUNT, PARTICIPATION_COUNT, AVERAGE_SCORE, AVERAGE_RANK -> true;
			default -> false;
		};
		if (!valid) {
			throw new StatsValidationException("UNSUPPORTED_METRIC_SCOPE_COMBINATION",
				"Metric '" + metric.getValue() + "' is not supported for player rankings.");
		}
	}

	// -------------------------------------------------------------------------
	// Distribution games
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public DistributionGamesResponse getDistributionGames(
		String scopeStr,
		UUID playerId,
		Instant from,
		Instant to,
		int limit,
		boolean includeOthers
	) {
		Scope scope = parseScope(scopeStr);

		if (scope == Scope.GAME) {
			throw new StatsValidationException("UNSUPPORTED_METRIC_SCOPE_COMBINATION",
				"scope=game is not supported for game distribution.");
		}
		if (scope == Scope.PLAYER && playerId == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER",
				"playerId is required for scope=player.");
		}
		if (limit < 1 || limit > 100) {
			throw new StatsValidationException("INVALID_LIMIT", "limit must be between 1 and 100.");
		}

		if (playerId != null) {
			resolvePlayer(playerId);
		}

		Instant resolvedTo = to != null ? to : Instant.now();
		Instant resolvedFrom = from != null ? from : resolvedTo.minus(365, ChronoUnit.DAYS);
		validateTimeRange(resolvedFrom, resolvedTo);

		List<StatsDistributionRepository.GameDistributionRowRaw> rawRows =
			distributionRepository.findDistributionGames(scope, playerId, resolvedFrom, resolvedTo, limit + 1);

		if (rawRows.isEmpty()) {
			return new DistributionGamesResponse(
				scope.getValue(),
				new DistributionGamesResponse.Filters(playerId, resolvedFrom, resolvedTo),
				0L,
				List.of()
			);
		}

		long totalSessionCount = rawRows.get(0).totalSessionCount();
		boolean hasMore = rawRows.size() > limit;
		List<StatsDistributionRepository.GameDistributionRowRaw> pageRows =
			hasMore ? rawRows.subList(0, limit) : rawRows;

		List<DistributionGamesResponse.Row> rows = buildGameDistributionRows(
			pageRows, hasMore && includeOthers, totalSessionCount
		);

		return new DistributionGamesResponse(
			scope.getValue(),
			new DistributionGamesResponse.Filters(playerId, resolvedFrom, resolvedTo),
			totalSessionCount,
			rows
		);
	}

	private List<DistributionGamesResponse.Row> buildGameDistributionRows(
		List<StatsDistributionRepository.GameDistributionRowRaw> pageRows,
		boolean addOthers,
		long totalSessionCount
	) {
		long othersCount = totalSessionCount - pageRows.stream().mapToLong(r -> r.sessionCount()).sum();

		List<Double> rawShares = new ArrayList<>();
		for (var raw : pageRows) {
			rawShares.add(totalSessionCount > 0 ? raw.sessionCount() * 100.0 / totalSessionCount : 0.0);
		}
		if (addOthers) {
			rawShares.add(totalSessionCount > 0 ? othersCount * 100.0 / totalSessionCount : 0.0);
		}

		List<Integer> shares = HamiltonAlgorithm.allocate(rawShares);

		List<DistributionGamesResponse.Row> rows = new ArrayList<>();
		for (int i = 0; i < pageRows.size(); i++) {
			var raw = pageRows.get(i);
			rows.add(new DistributionGamesResponse.Row(
				new DistributionGamesResponse.GameInfo(raw.gameId(), raw.gameName(), raw.resultType()),
				false,
				raw.sessionCount(),
				shares.get(i)
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
		String scopeStr,
		UUID playerId,
		UUID gameId,
		Instant from,
		Instant to,
		int limit,
		boolean includeOthers
	) {
		Scope scope = parseScope(scopeStr);

		if (gameId == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER",
				"gameId is required for score distribution.");
		}
		if (scope == Scope.PLAYER && playerId == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER",
				"playerId is required for scope=player.");
		}
		if (limit < 1 || limit > 100) {
			throw new StatsValidationException("INVALID_LIMIT", "limit must be between 1 and 100.");
		}

		var game = resolveGame(gameId);
		if (game.getResultType() == ResultType.NO_SCORE) {
			throw new StatsValidationException("NO_SCORE_UNSUPPORTED",
				"Score distribution is not supported for NO_SCORE games.");
		}
		if (playerId != null) {
			resolvePlayer(playerId);
		}

		Instant resolvedTo = to != null ? to : Instant.now();
		Instant resolvedFrom = from != null ? from : resolvedTo.minus(365, ChronoUnit.DAYS);
		validateTimeRange(resolvedFrom, resolvedTo);

		StatsDistributionRepository.ScoreRangeRaw range =
			distributionRepository.findScoreRange(scope, playerId, gameId, resolvedFrom, resolvedTo);

		if (range == null || range.sampleSize() == 0) {
			return new DistributionScoresResponse(
				scope.getValue(),
				new DistributionScoresResponse.Filters(playerId, gameId, resolvedFrom, resolvedTo),
				0L,
				List.of()
			);
		}

		List<ScoreBucketing.ScoreBucket> buckets = ScoreBucketing.compute(range.min(), range.max());
		List<StatsDistributionRepository.ScoreDistributionRowRaw> rawRows =
			distributionRepository.findDistributionScores(scope, playerId, gameId, resolvedFrom, resolvedTo, buckets);

		Map<Integer, Long> countByLower = new java.util.HashMap<>();
		for (var row : rawRows) {
			countByLower.put(row.lowerBound(), row.count());
		}

		long totalSampleSize = range.sampleSize();
		boolean hasMore = buckets.size() > limit;
		List<ScoreBucketing.ScoreBucket> pageBuckets = hasMore ? buckets.subList(0, limit) : buckets;

		List<Double> rawShares = new ArrayList<>();
		for (var bucket : pageBuckets) {
			long count = countByLower.getOrDefault(bucket.lowerInclusive(), 0L);
			rawShares.add(totalSampleSize > 0 ? count * 100.0 / totalSampleSize : 0.0);
		}

		long othersCount = 0;
		if (hasMore && includeOthers) {
			for (int i = limit; i < buckets.size(); i++) {
				othersCount += countByLower.getOrDefault(buckets.get(i).lowerInclusive(), 0L);
			}
			rawShares.add(totalSampleSize > 0 ? othersCount * 100.0 / totalSampleSize : 0.0);
		}

		List<Integer> shares = HamiltonAlgorithm.allocate(rawShares);

		List<DistributionScoresResponse.Row> rows = new ArrayList<>();
		for (int i = 0; i < pageBuckets.size(); i++) {
			var bucket = pageBuckets.get(i);
			long count = countByLower.getOrDefault(bucket.lowerInclusive(), 0L);
			rows.add(new DistributionScoresResponse.Row(
				new DistributionScoresResponse.BucketInfo(bucket.lowerInclusive(), bucket.upperExclusive(), bucket.label()),
				false,
				count,
				shares.get(i)
			));
		}
		if (hasMore && includeOthers) {
			rows.add(new DistributionScoresResponse.Row(null, true, othersCount, shares.get(shares.size() - 1)));
		}

		return new DistributionScoresResponse(
			scope.getValue(),
			new DistributionScoresResponse.Filters(playerId, gameId, resolvedFrom, resolvedTo),
			totalSampleSize,
			rows
		);
	}

	// -------------------------------------------------------------------------
	// Distribution wins
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public DistributionWinsResponse getDistributionWins(
		String scopeStr,
		UUID gameId,
		Instant from,
		Instant to
	) {
		Scope scope = parseScope(scopeStr);

		if (scope == Scope.PLAYER) {
			throw new StatsValidationException("UNSUPPORTED_METRIC_SCOPE_COMBINATION",
				"scope=player is not supported for wins distribution.");
		}
		if (scope == Scope.GAME && gameId == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER",
				"gameId is required for scope=game.");
		}

		if (gameId != null) {
			resolveGame(gameId);
		}

		Instant resolvedTo = to != null ? to : Instant.now();
		Instant resolvedFrom = from != null ? from : resolvedTo.minus(365, ChronoUnit.DAYS);
		validateTimeRange(resolvedFrom, resolvedTo);

		long totalPlayerCount = distributionRepository.countActivePlayersForWins(scope, gameId, resolvedFrom, resolvedTo);

		if (totalPlayerCount == 0) {
			return new DistributionWinsResponse(
				scope.getValue(),
				new DistributionWinsResponse.Filters(gameId, resolvedFrom, resolvedTo),
				0L,
				List.of()
			);
		}

		Map<String, Long> bucketCounts = distributionRepository.findDistributionWins(scope, gameId, resolvedFrom, resolvedTo);

		List<Map.Entry<String, String>> bucketDefs = List.of(
			Map.entry("0", "0 victoire"),
			Map.entry("1", "1 victoire"),
			Map.entry("2", "2 victoires"),
			Map.entry("3_PLUS", "3+ victoires")
		);

		List<Double> rawShares = bucketDefs.stream()
			.map(e -> bucketCounts.getOrDefault(e.getKey(), 0L) * 100.0 / totalPlayerCount)
			.toList();
		List<Integer> shares = HamiltonAlgorithm.allocate(new ArrayList<>(rawShares));

		List<DistributionWinsResponse.Row> rows = new ArrayList<>();
		for (int i = 0; i < bucketDefs.size(); i++) {
			var def = bucketDefs.get(i);
			long count = bucketCounts.getOrDefault(def.getKey(), 0L);
			rows.add(new DistributionWinsResponse.Row(
				new DistributionWinsResponse.BucketInfo(def.getKey(), def.getValue()),
				count,
				shares.get(i)
			));
		}

		return new DistributionWinsResponse(
			scope.getValue(),
			new DistributionWinsResponse.Filters(gameId, resolvedFrom, resolvedTo),
			totalPlayerCount,
			rows
		);
	}

	// -------------------------------------------------------------------------
	// Distribution participations
	// -------------------------------------------------------------------------

	@Override
	@Transactional(readOnly = true)
	public DistributionParticipationsResponse getDistributionParticipations(
		String scopeStr,
		UUID gameId,
		Instant from,
		Instant to
	) {
		Scope scope = parseScope(scopeStr);

		if (scope == Scope.PLAYER) {
			throw new StatsValidationException("UNSUPPORTED_METRIC_SCOPE_COMBINATION",
				"scope=player is not supported for participations distribution.");
		}
		if (scope == Scope.GAME && gameId == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER",
				"gameId is required for scope=game.");
		}

		if (gameId != null) {
			resolveGame(gameId);
		}

		Instant resolvedTo = to != null ? to : Instant.now();
		Instant resolvedFrom = from != null ? from : resolvedTo.minus(365, ChronoUnit.DAYS);
		validateTimeRange(resolvedFrom, resolvedTo);

		long totalPlayerCount = distributionRepository.countActivePlayersForParticipations(scope, gameId, resolvedFrom, resolvedTo);

		if (totalPlayerCount == 0) {
			return new DistributionParticipationsResponse(
				scope.getValue(),
				new DistributionParticipationsResponse.Filters(gameId, resolvedFrom, resolvedTo),
				0L,
				List.of()
			);
		}

		Map<String, Long> bucketCounts = distributionRepository.findDistributionParticipations(scope, gameId, resolvedFrom, resolvedTo);

		List<Map.Entry<String, String>> bucketDefs = List.of(
			Map.entry("1", "1 participation"),
			Map.entry("2_3", "2-3 participations"),
			Map.entry("4_6", "4-6 participations"),
			Map.entry("7_PLUS", "7+ participations")
		);

		List<Double> rawShares = bucketDefs.stream()
			.map(e -> bucketCounts.getOrDefault(e.getKey(), 0L) * 100.0 / totalPlayerCount)
			.toList();
		List<Integer> shares = HamiltonAlgorithm.allocate(new ArrayList<>(rawShares));

		List<DistributionParticipationsResponse.Row> rows = new ArrayList<>();
		for (int i = 0; i < bucketDefs.size(); i++) {
			var def = bucketDefs.get(i);
			long count = bucketCounts.getOrDefault(def.getKey(), 0L);
			rows.add(new DistributionParticipationsResponse.Row(
				new DistributionParticipationsResponse.BucketInfo(def.getKey(), def.getValue()),
				count,
				shares.get(i)
			));
		}

		return new DistributionParticipationsResponse(
			scope.getValue(),
			new DistributionParticipationsResponse.Filters(gameId, resolvedFrom, resolvedTo),
			totalPlayerCount,
			rows
		);
	}

	// -------------------------------------------------------------------------
	// Shared validation helpers
	// -------------------------------------------------------------------------

	private Metric parseMetric(String value) {
		if (value == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER", "metric is required.");
		}
		Metric metric = Metric.fromValue(value);
		if (metric == null) {
			throw new StatsValidationException("INVALID_PARAMETER_TYPE", "Unknown metric: " + value);
		}
		return metric;
	}

	private Scope parseScope(String value) {
		if (value == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER", "scope is required.");
		}
		Scope scope = Scope.fromValue(value);
		if (scope == null) {
			throw new StatsValidationException("INVALID_PARAMETER_TYPE", "Unknown scope: " + value);
		}
		return scope;
	}

	private Interval parseInterval(String value) {
		if (value == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER", "interval is required.");
		}
		Interval interval = Interval.fromValue(value);
		if (interval == null) {
			throw new StatsValidationException("INVALID_PARAMETER_TYPE", "Unknown interval: " + value);
		}
		return interval;
	}

	private void validateTimeRange(Instant from, Instant to) {
		if (!from.isBefore(to)) {
			throw new StatsValidationException("INVALID_TIME_RANGE",
				"from must be strictly before to.");
		}
	}

	private void validateBucketCount(Instant from, Instant to, Interval interval) {
		long days = ChronoUnit.DAYS.between(from, to);
		if (interval == Interval.WEEK && days / 7 > MAX_WEEK_BUCKETS) {
			throw new StatsValidationException("TIME_RANGE_TOO_LARGE",
				"Time range exceeds maximum of " + MAX_WEEK_BUCKETS + " weekly buckets.");
		}
		if (interval == Interval.MONTH && days / 30 > MAX_MONTH_BUCKETS) {
			throw new StatsValidationException("TIME_RANGE_TOO_LARGE",
				"Time range exceeds maximum of " + MAX_MONTH_BUCKETS + " monthly buckets.");
		}
	}

	private com.scorpanion.backend.entity.GameEntity resolveGame(UUID gameId) {
		return gameRepository.findById(gameId)
			.orElseThrow(() -> ResourceNotFoundException.game(gameId));
	}

	private void resolvePlayer(UUID playerId) {
		if (!playerRepository.existsById(playerId)) {
			throw ResourceNotFoundException.player(playerId);
		}
	}

	private static boolean isScoreMetric(Metric metric) {
		return metric == Metric.AVERAGE_SCORE || metric == Metric.MIN_SCORE || metric == Metric.MAX_SCORE;
	}
}
