package com.scorpanion.backend.stats.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.scorpanion.backend.stats.model.Scope;
import com.scorpanion.backend.stats.service.internal.ScoreBucketing;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

@Repository
public class StatsDistributionRepository {

	@PersistenceContext
	private EntityManager entityManager;

	public record GameDistributionRowRaw(
		UUID gameId,
		String gameName,
		String resultType,
		long sessionCount,
		long totalSessionCount
	) {
	}

	public record ScoreRangeRaw(int min, int max, long sampleSize) {
	}

	public record ScoreDistributionRowRaw(int lowerBound, long count) {
	}

	public record FixedBucketRowRaw(String bucketId, long count) {
	}

	// -------------------------------------------------------------------------
	// Distribution games
	// -------------------------------------------------------------------------

	public List<GameDistributionRowRaw> findDistributionGames(
		Scope scope,
		UUID playerId,
		Instant from,
		Instant to,
		int limitPlusOne
	) {
		String playerJoin = scope == Scope.PLAYER
			? "JOIN session_player_result spr ON spr.game_session_id = gs.id AND spr.player_id = :playerId"
			: "";

		String sql = """
			WITH game_stats AS (
			    SELECT
			        g.id AS game_id,
			        g.name AS game_name,
			        g.result_type AS result_type,
			        CAST(COUNT(DISTINCT gs.id) AS BIGINT) AS session_count,
			        CAST(SUM(COUNT(DISTINCT gs.id)) OVER() AS BIGINT) AS total_session_count,
			        ROW_NUMBER() OVER (ORDER BY COUNT(DISTINCT gs.id) DESC, g.name ASC, g.id ASC) AS rn
			    FROM game_session gs
			    %s
			    JOIN game g ON g.id = gs.game_id
			    WHERE gs.played_at >= :from
			      AND gs.played_at < :to
			    GROUP BY g.id, g.name, g.result_type
			)
			SELECT game_id, game_name, result_type, session_count, total_session_count
			FROM game_stats
			ORDER BY rn
			LIMIT :limitPlusOne
			""".formatted(playerJoin);

		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("from", from);
		query.setParameter("to", to);
		query.setParameter("limitPlusOne", limitPlusOne);
		if (playerId != null) {
			query.setParameter("playerId", playerId);
		}

		@SuppressWarnings("unchecked")
		List<Object[]> rows = query.getResultList();
		List<GameDistributionRowRaw> result = new ArrayList<>(rows.size());
		for (Object[] row : rows) {
			UUID gameId = toUuid(row[0]);
			String gameName = (String) row[1];
			String resultType = (String) row[2];
			long sessionCount = toLong(row[3]);
			long totalSessionCount = toLong(row[4]);
			result.add(new GameDistributionRowRaw(gameId, gameName, resultType, sessionCount, totalSessionCount));
		}
		return result;
	}

	// -------------------------------------------------------------------------
	// Distribution scores
	// -------------------------------------------------------------------------

	public ScoreRangeRaw findScoreRange(Scope scope, UUID playerId, UUID gameId, Instant from, Instant to) {
		String playerFilter = scope == Scope.PLAYER ? "AND spr.player_id = :playerId" : "";

		String sql = """
			SELECT
			    CAST(MIN(spr.score) AS BIGINT) AS min_score,
			    CAST(MAX(spr.score) AS BIGINT) AS max_score,
			    CAST(COUNT(spr.score) AS BIGINT) AS sample_size
			FROM session_player_result spr
			JOIN game_session gs ON gs.id = spr.game_session_id
			WHERE gs.game_id = :gameId
			  AND spr.score IS NOT NULL
			  AND gs.played_at >= :from
			  AND gs.played_at < :to
			  %s
			""".formatted(playerFilter);

		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("gameId", gameId);
		query.setParameter("from", from);
		query.setParameter("to", to);
		if (playerId != null) {
			query.setParameter("playerId", playerId);
		}

		Object[] row = (Object[]) query.getSingleResult();
		if (row[0] == null) {
			return null;
		}
		int min = toInt(row[0]);
		int max = toInt(row[1]);
		long sampleSize = toLong(row[2]);
		return new ScoreRangeRaw(min, max, sampleSize);
	}

	public List<ScoreDistributionRowRaw> findDistributionScores(
		Scope scope,
		UUID playerId,
		UUID gameId,
		Instant from,
		Instant to,
		List<ScoreBucketing.ScoreBucket> buckets
	) {
		String playerFilter = scope == Scope.PLAYER ? "AND spr.player_id = :playerId" : "";
		String bucketCaseExpr = buildScoreBucketCaseExpr(buckets);

		String sql = """
			SELECT
			    %s AS lower_bound,
			    CAST(COUNT(*) AS BIGINT) AS count
			FROM session_player_result spr
			JOIN game_session gs ON gs.id = spr.game_session_id
			WHERE gs.game_id = :gameId
			  AND spr.score IS NOT NULL
			  AND gs.played_at >= :from
			  AND gs.played_at < :to
			  %s
			GROUP BY lower_bound
			ORDER BY lower_bound
			""".formatted(bucketCaseExpr, playerFilter);

		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("gameId", gameId);
		query.setParameter("from", from);
		query.setParameter("to", to);
		if (playerId != null) {
			query.setParameter("playerId", playerId);
		}

		@SuppressWarnings("unchecked")
		List<Object[]> rows = query.getResultList();
		List<ScoreDistributionRowRaw> result = new ArrayList<>(rows.size());
		for (Object[] row : rows) {
			int lowerBound = toInt(row[0]);
			long count = toLong(row[1]);
			result.add(new ScoreDistributionRowRaw(lowerBound, count));
		}
		return result;
	}

	private static String buildScoreBucketCaseExpr(List<ScoreBucketing.ScoreBucket> buckets) {
		StringBuilder sb = new StringBuilder("CASE");
		for (ScoreBucketing.ScoreBucket bucket : buckets) {
			sb.append(String.format(
				" WHEN spr.score >= %d AND spr.score < %d THEN %d",
				bucket.lowerInclusive(), bucket.upperExclusive(), bucket.lowerInclusive()
			));
		}
		sb.append(" END");
		return sb.toString();
	}

	// -------------------------------------------------------------------------
	// Distribution wins
	// -------------------------------------------------------------------------

	public Map<String, Long> findDistributionWins(Scope scope, UUID gameId, Instant from, Instant to) {
		String gameFilter = scope == Scope.GAME ? "AND gs.game_id = :gameId" : "";

		String sql = """
			WITH player_wins AS (
			    SELECT
			        spr.player_id,
			        CAST(COUNT(CASE WHEN spr.is_winner THEN 1 END) AS BIGINT) AS win_count
			    FROM session_player_result spr
			    JOIN game_session gs ON gs.id = spr.game_session_id
			    WHERE gs.played_at >= :from
			      AND gs.played_at < :to
			      %s
			    GROUP BY spr.player_id
			),
			bucketed AS (
			    SELECT
			        CASE
			            WHEN win_count = 0 THEN '0'
			            WHEN win_count = 1 THEN '1'
			            WHEN win_count = 2 THEN '2'
			            ELSE '3_PLUS'
			        END AS bucket_id,
			        CAST(COUNT(*) AS BIGINT) AS count
			    FROM player_wins
			    GROUP BY 1
			),
			all_buckets AS (
			    SELECT id FROM (VALUES ('0'), ('1'), ('2'), ('3_PLUS')) AS t(id)
			)
			SELECT ab.id AS bucket_id, COALESCE(b.count, 0) AS count
			FROM all_buckets ab
			LEFT JOIN bucketed b ON b.bucket_id = ab.id
			ORDER BY array_position(ARRAY['0','1','2','3_PLUS']::text[], ab.id)
			""".formatted(gameFilter);

		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("from", from);
		query.setParameter("to", to);
		if (gameId != null) {
			query.setParameter("gameId", gameId);
		}

		@SuppressWarnings("unchecked")
		List<Object[]> rows = query.getResultList();
		Map<String, Long> result = new LinkedHashMap<>();
		for (Object[] row : rows) {
			result.put((String) row[0], toLong(row[1]));
		}
		return result;
	}

	public long countActivePlayersForWins(Scope scope, UUID gameId, Instant from, Instant to) {
		String gameFilter = scope == Scope.GAME ? "AND gs.game_id = :gameId" : "";

		String sql = """
			SELECT CAST(COUNT(DISTINCT spr.player_id) AS BIGINT)
			FROM session_player_result spr
			JOIN game_session gs ON gs.id = spr.game_session_id
			WHERE gs.played_at >= :from
			  AND gs.played_at < :to
			  %s
			""".formatted(gameFilter);

		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("from", from);
		query.setParameter("to", to);
		if (gameId != null) {
			query.setParameter("gameId", gameId);
		}

		return toLong(query.getSingleResult());
	}

	// -------------------------------------------------------------------------
	// Distribution participations
	// -------------------------------------------------------------------------

	public Map<String, Long> findDistributionParticipations(Scope scope, UUID gameId, Instant from, Instant to) {
		String gameFilter = scope == Scope.GAME ? "AND gs.game_id = :gameId" : "";

		String sql = """
			WITH player_participations AS (
			    SELECT
			        spr.player_id,
			        CAST(COUNT(*) AS BIGINT) AS participation_count
			    FROM session_player_result spr
			    JOIN game_session gs ON gs.id = spr.game_session_id
			    WHERE gs.played_at >= :from
			      AND gs.played_at < :to
			      %s
			    GROUP BY spr.player_id
			),
			bucketed AS (
			    SELECT
			        CASE
			            WHEN participation_count = 1 THEN '1'
			            WHEN participation_count BETWEEN 2 AND 3 THEN '2_3'
			            WHEN participation_count BETWEEN 4 AND 6 THEN '4_6'
			            ELSE '7_PLUS'
			        END AS bucket_id,
			        CAST(COUNT(*) AS BIGINT) AS count
			    FROM player_participations
			    GROUP BY 1
			),
			all_buckets AS (
			    SELECT id FROM (VALUES ('1'), ('2_3'), ('4_6'), ('7_PLUS')) AS t(id)
			)
			SELECT ab.id AS bucket_id, COALESCE(b.count, 0) AS count
			FROM all_buckets ab
			LEFT JOIN bucketed b ON b.bucket_id = ab.id
			ORDER BY array_position(ARRAY['1','2_3','4_6','7_PLUS']::text[], ab.id)
			""".formatted(gameFilter);

		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("from", from);
		query.setParameter("to", to);
		if (gameId != null) {
			query.setParameter("gameId", gameId);
		}

		@SuppressWarnings("unchecked")
		List<Object[]> rows = query.getResultList();
		Map<String, Long> result = new LinkedHashMap<>();
		for (Object[] row : rows) {
			result.put((String) row[0], toLong(row[1]));
		}
		return result;
	}

	public long countActivePlayersForParticipations(Scope scope, UUID gameId, Instant from, Instant to) {
		return countActivePlayersForWins(scope, gameId, from, to);
	}

	// -------------------------------------------------------------------------
	// Type helpers
	// -------------------------------------------------------------------------

	private static UUID toUuid(Object value) {
		if (value instanceof UUID uuid) {
			return uuid;
		}
		return UUID.fromString(value.toString());
	}

	private static long toLong(Object value) {
		if (value == null) {
			return 0L;
		}
		if (value instanceof Long l) {
			return l;
		}
		if (value instanceof BigDecimal bd) {
			return bd.longValue();
		}
		return ((Number) value).longValue();
	}

	private static int toInt(Object value) {
		if (value instanceof Integer i) {
			return i;
		}
		if (value instanceof Long l) {
			return l.intValue();
		}
		if (value instanceof BigDecimal bd) {
			return bd.intValue();
		}
		return ((Number) value).intValue();
	}
}
