package com.scorpanion.backend.stats.repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.scorpanion.backend.stats.model.Interval;
import com.scorpanion.backend.stats.model.Metric;
import com.scorpanion.backend.stats.model.Scope;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

@Repository
public class StatsTimeseriesRepository {

	@PersistenceContext
	private EntityManager entityManager;

	public record TimeseriesPoint(Instant bucketStart, Long value, Long sampleSize) {
	}

	public List<TimeseriesPoint> findTimeseries(
		Metric metric,
		Scope scope,
		Interval interval,
		Instant from,
		Instant to,
		UUID playerId,
		UUID gameId
	) {
		String dataCte = buildDataCte(metric, scope, playerId, gameId);
		String valueCoalesce = metric.isCounting() ? "COALESCE(d.value, 0)" : "d.value";

		String sql = """
			WITH series AS (
			    SELECT generate_series(
			        date_trunc(:intervalUnit, CAST(:from AS timestamptz)),
			        date_trunc(:intervalUnit, CAST(:to AS timestamptz) - INTERVAL '1 second'),
			        ('1 ' || :intervalUnit)::interval
			    ) AS bucket_start
			),
			data AS (
			%s
			)
			SELECT
			    s.bucket_start,
			    %s AS value,
			    COALESCE(d.sample_size, 0) AS sample_size
			FROM series s
			LEFT JOIN data d ON d.bucket_start = s.bucket_start
			ORDER BY s.bucket_start
			""".formatted(dataCte, valueCoalesce);

		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("intervalUnit", interval.getValue());
		query.setParameter("from", from);
		query.setParameter("to", to);
		if (playerId != null) {
			query.setParameter("playerId", playerId);
		}
		if (gameId != null) {
			query.setParameter("gameId", gameId);
		}

		@SuppressWarnings("unchecked")
		List<Object[]> rows = query.getResultList();
		List<TimeseriesPoint> result = new ArrayList<>(rows.size());
		for (Object[] row : rows) {
			Instant bucketStart = RepositoryUtils.toInstant(row[0]);
			Long value = RepositoryUtils.toLongOrNull(row[1]);
			Long sampleSize = RepositoryUtils.toLong(row[2]);
			result.add(new TimeseriesPoint(bucketStart, value, sampleSize));
		}
		return result;
	}

	private String buildDataCte(Metric metric, Scope scope, UUID playerId, UUID gameId) {
		String intervalUnit = ":intervalUnit";
		String baseFilters = "gs.played_at >= :from AND gs.played_at < :to";

		return switch (metric) {
			case SESSION_COUNT -> switch (scope) {
				case GLOBAL -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(COUNT(*) AS BIGINT) AS value,
					        CAST(COUNT(*) AS BIGINT) AS sample_size
					    FROM game_session gs
					    WHERE %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters);
				case PLAYER -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(COUNT(DISTINCT gs.id) AS BIGINT) AS value,
					        CAST(COUNT(DISTINCT gs.id) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND spr.player_id = :playerId
					      %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters, optionalGameFilter(gameId));
				case GAME -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(COUNT(*) AS BIGINT) AS value,
					        CAST(COUNT(*) AS BIGINT) AS sample_size
					    FROM game_session gs
					    WHERE %s
					      AND gs.game_id = :gameId
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters);
			};
			case PARTICIPATION_COUNT -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(COUNT(*) AS BIGINT) AS value,
					        CAST(COUNT(*) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND spr.player_id = :playerId
					      %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters, optionalGameFilter(gameId));
			case WIN_COUNT -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(COUNT(CASE WHEN spr.is_winner THEN 1 END) AS BIGINT) AS value,
					        CAST(COUNT(*) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND spr.player_id = :playerId
					      %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters, optionalGameFilter(gameId));
			case WIN_RATE -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(ROUND(COUNT(CASE WHEN spr.is_winner THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) AS BIGINT) AS value,
					        CAST(COUNT(*) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND spr.player_id = :playerId
					      %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters, optionalGameFilter(gameId));
			case AVERAGE_SCORE -> switch (scope) {
				case PLAYER -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(ROUND(AVG(spr.score)) AS BIGINT) AS value,
					        CAST(COUNT(spr.score) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND spr.player_id = :playerId
					      AND gs.game_id = :gameId
					      AND spr.score IS NOT NULL
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters);
				case GAME -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(ROUND(AVG(spr.score)) AS BIGINT) AS value,
					        CAST(COUNT(spr.score) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND gs.game_id = :gameId
					      AND spr.score IS NOT NULL
					      %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters, optionalPlayerFilter(playerId));
				default -> throw new IllegalArgumentException("Unsupported scope for AVERAGE_SCORE: " + scope);
			};
			case MIN_SCORE -> switch (scope) {
				case PLAYER -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(MIN(spr.score) AS BIGINT) AS value,
					        CAST(COUNT(spr.score) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND spr.player_id = :playerId
					      AND gs.game_id = :gameId
					      AND spr.score IS NOT NULL
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters);
				case GAME -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(MIN(spr.score) AS BIGINT) AS value,
					        CAST(COUNT(spr.score) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND gs.game_id = :gameId
					      AND spr.score IS NOT NULL
					      %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters, optionalPlayerFilter(playerId));
				default -> throw new IllegalArgumentException("Unsupported scope for MIN_SCORE: " + scope);
			};
			case MAX_SCORE -> switch (scope) {
				case PLAYER -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(MAX(spr.score) AS BIGINT) AS value,
					        CAST(COUNT(spr.score) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND spr.player_id = :playerId
					      AND gs.game_id = :gameId
					      AND spr.score IS NOT NULL
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters);
				case GAME -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(MAX(spr.score) AS BIGINT) AS value,
					        CAST(COUNT(spr.score) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND gs.game_id = :gameId
					      AND spr.score IS NOT NULL
					      %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters, optionalPlayerFilter(playerId));
				default -> throw new IllegalArgumentException("Unsupported scope for MAX_SCORE: " + scope);
			};
			case AVERAGE_RANK -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(ROUND(AVG(spr.rank)) AS BIGINT) AS value,
					        CAST(COUNT(spr.rank) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND spr.player_id = :playerId
					      AND spr.rank IS NOT NULL
					      %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters, optionalGameFilter(gameId));
			case PLAYED_GAME_COUNT -> switch (scope) {
				case GLOBAL -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(COUNT(DISTINCT gs.game_id) AS BIGINT) AS value,
					        CAST(COUNT(*) AS BIGINT) AS sample_size
					    FROM game_session gs
					    WHERE %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters);
				case PLAYER -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(COUNT(DISTINCT gs.game_id) AS BIGINT) AS value,
					        CAST(COUNT(DISTINCT gs.id) AS BIGINT) AS sample_size
					    FROM session_player_result spr
					    JOIN game_session gs ON gs.id = spr.game_session_id
					    WHERE %s
					      AND spr.player_id = :playerId
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters);
				default -> throw new IllegalArgumentException("Unsupported scope for PLAYED_GAME_COUNT: " + scope);
			};
			case ACTIVE_PLAYER_COUNT -> switch (scope) {
				case GLOBAL -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(COUNT(DISTINCT spr.player_id) AS BIGINT) AS value,
					        CAST(COUNT(spr.id) AS BIGINT) AS sample_size
					    FROM game_session gs
					    JOIN session_player_result spr ON spr.game_session_id = gs.id
					    WHERE %s
					      %s
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters, optionalGameFilter(gameId));
				case GAME -> """
					    SELECT
					        date_trunc(%s, gs.played_at) AS bucket_start,
					        CAST(COUNT(DISTINCT spr.player_id) AS BIGINT) AS value,
					        CAST(COUNT(spr.id) AS BIGINT) AS sample_size
					    FROM game_session gs
					    JOIN session_player_result spr ON spr.game_session_id = gs.id
					    WHERE %s
					      AND gs.game_id = :gameId
					    GROUP BY 1
					""".formatted(intervalUnit, baseFilters);
				default -> throw new IllegalArgumentException("Unsupported scope for ACTIVE_PLAYER_COUNT: " + scope);
			};
		};
	}

	private static String optionalGameFilter(UUID gameId) {
		return gameId != null ? "AND gs.game_id = :gameId" : "";
	}

	private static String optionalPlayerFilter(UUID playerId) {
		return playerId != null ? "AND spr.player_id = :playerId" : "";
	}

}
