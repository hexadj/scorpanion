package com.scorpanion.backend.stats.service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.scorpanion.backend.exception.ResourceNotFoundException;
import com.scorpanion.backend.model.ResultType;
import com.scorpanion.backend.repository.GameRepository;
import com.scorpanion.backend.repository.PlayerRepository;
import com.scorpanion.backend.stats.exception.StatsValidationException;
import com.scorpanion.backend.stats.model.Interval;
import com.scorpanion.backend.stats.model.Metric;
import com.scorpanion.backend.stats.model.Scope;
import com.scorpanion.backend.stats.service.query.DistributionGamesQuery;
import com.scorpanion.backend.stats.service.query.DistributionParticipationsQuery;
import com.scorpanion.backend.stats.service.query.DistributionScoresQuery;
import com.scorpanion.backend.stats.service.query.DistributionWinsQuery;
import com.scorpanion.backend.stats.service.query.RankingsPlayersQuery;
import com.scorpanion.backend.stats.service.query.TimeseriesQuery;

@Component
public class StatsQueryValidator {

	private static final int MAX_HOUR_BUCKETS = 168;
	private static final int MAX_DAY_BUCKETS = 366;
	private static final int MAX_WEEK_BUCKETS = 260;
	private static final int MAX_MONTH_BUCKETS = 120;

	private final GameRepository gameRepository;
	private final PlayerRepository playerRepository;

	public StatsQueryValidator(GameRepository gameRepository, PlayerRepository playerRepository) {
		this.gameRepository = gameRepository;
		this.playerRepository = playerRepository;
	}

	// -------------------------------------------------------------------------
	// Timeseries
	// -------------------------------------------------------------------------

	public TimeseriesQuery validateTimeseries(
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

		Instant resolvedTo = resolveToDefault(to);
		Instant resolvedFrom = resolveFromDefault(from, resolvedTo);
		validateTimeRange(resolvedFrom, resolvedTo);
		validateBucketCount(resolvedFrom, resolvedTo, interval);

		validateTimeseriesRequiredFilters(metric, scope, playerId, gameId);

		if (playerId != null) {
			requirePlayer(playerId);
		}
		if (gameId != null) {
			var game = requireGame(gameId);
			if (isScoreMetric(metric) && game.getResultType() == ResultType.NO_SCORE) {
				throw new StatsValidationException("NO_SCORE_UNSUPPORTED",
					"This metric is not supported for NO_SCORE games.");
			}
		}

		return new TimeseriesQuery(metric, scope, interval, resolvedFrom, resolvedTo, playerId, gameId);
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

	public RankingsPlayersQuery validateRankingsPlayers(
		String metricStr,
		Instant from,
		Instant to,
		UUID gameId,
		int limit,
		int offset
	) {
		Metric metric = parseMetric(metricStr);
		validateRankingMetric(metric);
		validateLimit(limit, 100);
		validateOffset(offset);

		Instant resolvedTo = resolveToDefault(to);
		Instant resolvedFrom = resolveFromDefault(from, resolvedTo);
		validateTimeRange(resolvedFrom, resolvedTo);

		if (metric == Metric.AVERAGE_SCORE && gameId == null) {
			throw new StatsValidationException("MISSING_REQUIRED_FILTER",
				"gameId is required for averageScore ranking.");
		}
		if (gameId != null) {
			var game = requireGame(gameId);
			if (metric == Metric.AVERAGE_SCORE && game.getResultType() == ResultType.NO_SCORE) {
				throw new StatsValidationException("NO_SCORE_UNSUPPORTED",
					"averageScore ranking is not supported for NO_SCORE games.");
			}
		}

		return new RankingsPlayersQuery(metric, resolvedFrom, resolvedTo, gameId, limit, offset);
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

	public DistributionGamesQuery validateDistributionGames(
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
		validateLimit(limit, 100);

		if (playerId != null) {
			requirePlayer(playerId);
		}

		Instant resolvedTo = resolveToDefault(to);
		Instant resolvedFrom = resolveFromDefault(from, resolvedTo);
		validateTimeRange(resolvedFrom, resolvedTo);

		return new DistributionGamesQuery(scope, playerId, resolvedFrom, resolvedTo, limit, includeOthers);
	}

	// -------------------------------------------------------------------------
	// Distribution scores
	// -------------------------------------------------------------------------

	public DistributionScoresQuery validateDistributionScores(
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
		validateLimit(limit, 100);

		var game = requireGame(gameId);
		if (game.getResultType() == ResultType.NO_SCORE) {
			throw new StatsValidationException("NO_SCORE_UNSUPPORTED",
				"Score distribution is not supported for NO_SCORE games.");
		}
		if (playerId != null) {
			requirePlayer(playerId);
		}

		Instant resolvedTo = resolveToDefault(to);
		Instant resolvedFrom = resolveFromDefault(from, resolvedTo);
		validateTimeRange(resolvedFrom, resolvedTo);

		return new DistributionScoresQuery(scope, playerId, gameId, resolvedFrom, resolvedTo, limit, includeOthers);
	}

	// -------------------------------------------------------------------------
	// Distribution wins
	// -------------------------------------------------------------------------

	public DistributionWinsQuery validateDistributionWins(
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
			requireGame(gameId);
		}

		Instant resolvedTo = resolveToDefault(to);
		Instant resolvedFrom = resolveFromDefault(from, resolvedTo);
		validateTimeRange(resolvedFrom, resolvedTo);

		return new DistributionWinsQuery(scope, gameId, resolvedFrom, resolvedTo);
	}

	// -------------------------------------------------------------------------
	// Distribution participations
	// -------------------------------------------------------------------------

	public DistributionParticipationsQuery validateDistributionParticipations(
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
			requireGame(gameId);
		}

		Instant resolvedTo = resolveToDefault(to);
		Instant resolvedFrom = resolveFromDefault(from, resolvedTo);
		validateTimeRange(resolvedFrom, resolvedTo);

		return new DistributionParticipationsQuery(scope, gameId, resolvedFrom, resolvedTo);
	}

	// -------------------------------------------------------------------------
	// Shared parsing and validation primitives
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
		long hours = ChronoUnit.HOURS.between(from, to);
		long days = ChronoUnit.DAYS.between(from, to);
		if (interval == Interval.HOUR && hours > MAX_HOUR_BUCKETS) {
			throw new StatsValidationException("TIME_RANGE_TOO_LARGE",
				"Time range exceeds maximum of " + MAX_HOUR_BUCKETS + " hourly buckets.");
		}
		if (interval == Interval.DAY && days > MAX_DAY_BUCKETS) {
			throw new StatsValidationException("TIME_RANGE_TOO_LARGE",
				"Time range exceeds maximum of " + MAX_DAY_BUCKETS + " daily buckets.");
		}
		if (interval == Interval.WEEK && days / 7 > MAX_WEEK_BUCKETS) {
			throw new StatsValidationException("TIME_RANGE_TOO_LARGE",
				"Time range exceeds maximum of " + MAX_WEEK_BUCKETS + " weekly buckets.");
		}
		if (interval == Interval.MONTH) {
			long months = ChronoUnit.MONTHS.between(
				from.atZone(ZoneOffset.UTC).toLocalDate(),
				to.atZone(ZoneOffset.UTC).toLocalDate());
			if (months > MAX_MONTH_BUCKETS) {
				throw new StatsValidationException("TIME_RANGE_TOO_LARGE",
					"Time range exceeds maximum of " + MAX_MONTH_BUCKETS + " monthly buckets.");
			}
		}
	}

	private void validateLimit(int limit, int max) {
		if (limit < 1 || limit > max) {
			throw new StatsValidationException("INVALID_LIMIT",
				"limit must be between 1 and " + max + ".");
		}
	}

	private void validateOffset(int offset) {
		if (offset < 0) {
			throw new StatsValidationException("INVALID_OFFSET", "offset must be >= 0.");
		}
	}

	private static Instant resolveToDefault(Instant to) {
		return to != null ? to : Instant.now();
	}

	private static Instant resolveFromDefault(Instant from, Instant resolvedTo) {
		return from != null ? from : resolvedTo.minus(365, ChronoUnit.DAYS);
	}

	private com.scorpanion.backend.entity.GameEntity requireGame(UUID gameId) {
		return gameRepository.findById(gameId)
			.orElseThrow(() -> ResourceNotFoundException.game(gameId));
	}

	private void requirePlayer(UUID playerId) {
		if (!playerRepository.existsById(playerId)) {
			throw ResourceNotFoundException.player(playerId);
		}
	}

	private static boolean isScoreMetric(Metric metric) {
		return metric == Metric.AVERAGE_SCORE || metric == Metric.MIN_SCORE || metric == Metric.MAX_SCORE;
	}
}
