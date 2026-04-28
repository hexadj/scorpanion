package com.scorpanion.backend.service.result;

import com.scorpanion.backend.entity.GameSessionEntity;

import java.util.List;

public record GameSessionHistoryPage(
	List<GameSessionEntity> gameSessions,
	String nextCursor,
	boolean hasMore
) {

	public GameSessionHistoryPage {
		gameSessions = gameSessions == null ? List.of() : List.copyOf(gameSessions);
	}
}
