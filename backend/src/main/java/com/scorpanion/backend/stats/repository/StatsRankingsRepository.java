package com.scorpanion.backend.stats.repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.scorpanion.backend.stats.model.Metric;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

@Repository
public class StatsRankingsRepository {

	@PersistenceContext
	private EntityManager entityManager;

	public record RankingRowRaw(
		UUID playerId,
		String playerName,
		Long metricValue,
		Long winCount,
		Long participationCount
	) {
	}

	public List<RankingRowRaw> findRankingsPlayers(
		Metric metric,
		Instant from,
		Instant to,
		UUID gameId,
		int limit,
		int offset
	) {
		String metricExpr = buildMetricExpression(metric);
		String orderClause = buildOrderClause(metric);
		String gameJoinCondition = gameId != null ? "AND gs.game_id = :gameId" : "";

		String sql = """
			WITH player_stats AS (
			    SELECT
			        p.id AS player_id,
			        p.name AS player_name,
			        CAST(COUNT(CASE WHEN spr.is_winner THEN 1 END) AS BIGINT) AS win_count,
			        CAST(COUNT(spr.id) AS BIGINT) AS participation_count,
			        %s AS metric_value
			    FROM player p
			    LEFT JOIN session_player_result spr ON spr.player_id = p.id
			    LEFT JOIN game_session gs ON gs.id = spr.game_session_id
			        AND gs.played_at >= :from
			        AND gs.played_at < :to
			        %s
			    GROUP BY p.id, p.name
			)
			SELECT player_id, player_name, win_count, participation_count, metric_value
			FROM player_stats
			ORDER BY %s
			LIMIT :limit OFFSET :offset
			""".formatted(metricExpr, gameJoinCondition, orderClause);

		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("from", from);
		query.setParameter("to", to);
		query.setParameter("limit", limit);
		query.setParameter("offset", offset);
		if (gameId != null) {
			query.setParameter("gameId", gameId);
		}

		@SuppressWarnings("unchecked")
		List<Object[]> rows = query.getResultList();
		List<RankingRowRaw> result = new ArrayList<>(rows.size());
		for (Object[] row : rows) {
			UUID playerId = RepositoryUtils.toUuid(row[0]);
			String playerName = (String) row[1];
			Long winCount = RepositoryUtils.toLong(row[2]);
			Long participationCount = RepositoryUtils.toLong(row[3]);
			Long metricValue = RepositoryUtils.toLongOrNull(row[4]);
			result.add(new RankingRowRaw(playerId, playerName, metricValue, winCount, participationCount));
		}
		return result;
	}

	public long countRankingsPlayers(Instant from, Instant to, UUID gameId) {
		String gameJoinCondition = gameId != null ? "AND gs.game_id = :gameId" : "";

		String sql = """
			SELECT CAST(COUNT(DISTINCT p.id) AS BIGINT)
			FROM player p
			LEFT JOIN session_player_result spr ON spr.player_id = p.id
			LEFT JOIN game_session gs ON gs.id = spr.game_session_id
			    AND gs.played_at >= :from
			    AND gs.played_at < :to
			    %s
			""".formatted(gameJoinCondition);

		Query query = entityManager.createNativeQuery(sql);
		query.setParameter("from", from);
		query.setParameter("to", to);
		if (gameId != null) {
			query.setParameter("gameId", gameId);
		}

		return RepositoryUtils.toLong(query.getSingleResult());
	}

	private static String buildMetricExpression(Metric metric) {
		return switch (metric) {
			case WIN_RATE -> "CAST(ROUND(COUNT(CASE WHEN spr.is_winner THEN 1 END) * 100.0 / NULLIF(COUNT(spr.id), 0)) AS BIGINT)";
			case WIN_COUNT -> "CAST(COUNT(CASE WHEN spr.is_winner THEN 1 END) AS BIGINT)";
			case PARTICIPATION_COUNT -> "CAST(COUNT(spr.id) AS BIGINT)";
			case AVERAGE_SCORE -> "CAST(ROUND(AVG(spr.score)) AS BIGINT)";
			case AVERAGE_RANK -> "CAST(ROUND(AVG(spr.rank)) AS BIGINT)";
			default -> throw new IllegalArgumentException("Unsupported ranking metric: " + metric);
		};
	}

	private static String buildOrderClause(Metric metric) {
		return switch (metric) {
			case WIN_RATE -> """
				metric_value DESC NULLS LAST,
				win_count DESC NULLS LAST,
				participation_count DESC NULLS LAST,
				player_name ASC,
				player_id ASC
				""";
			case WIN_COUNT -> """
				metric_value DESC NULLS LAST,
				CAST(ROUND(win_count * 100.0 / NULLIF(participation_count, 0)) AS BIGINT) DESC NULLS LAST,
				participation_count DESC NULLS LAST,
				player_name ASC,
				player_id ASC
				""";
			case PARTICIPATION_COUNT -> """
				metric_value DESC NULLS LAST,
				win_count DESC NULLS LAST,
				CAST(ROUND(win_count * 100.0 / NULLIF(participation_count, 0)) AS BIGINT) DESC NULLS LAST,
				player_name ASC,
				player_id ASC
				""";
			case AVERAGE_SCORE -> """
				metric_value DESC NULLS LAST,
				participation_count DESC NULLS LAST,
				CAST(ROUND(win_count * 100.0 / NULLIF(participation_count, 0)) AS BIGINT) DESC NULLS LAST,
				player_name ASC,
				player_id ASC
				""";
			case AVERAGE_RANK -> """
				metric_value ASC NULLS LAST,
				participation_count DESC NULLS LAST,
				CAST(ROUND(win_count * 100.0 / NULLIF(participation_count, 0)) AS BIGINT) DESC NULLS LAST,
				player_name ASC,
				player_id ASC
				""";
			default -> throw new IllegalArgumentException("Unsupported ranking metric: " + metric);
		};
	}

}
