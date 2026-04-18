package com.scorpanion.backend.dto;

import java.util.List;

public record GameSessionHistoryResponse(
	List<GameSessionResponse> gameSessions,
	String nextCursor,
	boolean hasMore
) {

	public GameSessionHistoryResponse {
		gameSessions = gameSessions == null ? List.of() : List.copyOf(gameSessions);
	}
}
