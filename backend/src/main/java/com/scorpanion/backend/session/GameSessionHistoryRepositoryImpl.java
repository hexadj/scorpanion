package com.scorpanion.backend.session;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public class GameSessionHistoryRepositoryImpl implements GameSessionHistoryRepository {

	@PersistenceContext
	private EntityManager entityManager;

	@Override
	public List<UUID> findHistoryPageIds(
		Set<UUID> gameIds,
		Set<UUID> playerIds,
		Instant cursorPlayedAt,
		UUID cursorId,
		int limitPlusOne
	) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<UUID> criteriaQuery = criteriaBuilder.createQuery(UUID.class);
		Root<GameSessionEntity> gameSession = criteriaQuery.from(GameSessionEntity.class);

		List<Predicate> predicates = new ArrayList<>();

		if (!gameIds.isEmpty()) {
			predicates.add(gameSession.get("game").get("id").in(gameIds));
		}

		if (!playerIds.isEmpty()) {
			Subquery<Integer> playerMatchSubquery = criteriaQuery.subquery(Integer.class);
			Root<SessionPlayerResultEntity> sessionPlayerResult = playerMatchSubquery.from(SessionPlayerResultEntity.class);
			playerMatchSubquery.select(criteriaBuilder.literal(1));
			playerMatchSubquery.where(
				criteriaBuilder.and(
					criteriaBuilder.equal(sessionPlayerResult.get("gameSession"), gameSession),
					sessionPlayerResult.get("player").get("id").in(playerIds)
				)
			);
			predicates.add(criteriaBuilder.exists(playerMatchSubquery));
		}

		if (cursorPlayedAt != null && cursorId != null) {
			Predicate olderPlayedAt = criteriaBuilder.lessThan(gameSession.get("playedAt"), cursorPlayedAt);
			Predicate samePlayedAtLowerId = criteriaBuilder.and(
				criteriaBuilder.equal(gameSession.get("playedAt"), cursorPlayedAt),
				criteriaBuilder.lessThan(gameSession.get("id"), cursorId)
			);
			predicates.add(criteriaBuilder.or(olderPlayedAt, samePlayedAtLowerId));
		}

		criteriaQuery.select(gameSession.get("id"));
		if (!predicates.isEmpty()) {
			criteriaQuery.where(predicates.toArray(Predicate[]::new));
		}
		criteriaQuery.orderBy(
			criteriaBuilder.desc(gameSession.get("playedAt")),
			criteriaBuilder.desc(gameSession.get("id"))
		);

		TypedQuery<UUID> query = entityManager.createQuery(criteriaQuery);
		query.setMaxResults(limitPlusOne);
		return query.getResultList();
	}
}


