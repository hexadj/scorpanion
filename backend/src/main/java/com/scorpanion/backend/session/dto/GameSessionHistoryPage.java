package com.scorpanion.backend.session.dto;

import com.scorpanion.backend.session.GameSessionEntity;

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


