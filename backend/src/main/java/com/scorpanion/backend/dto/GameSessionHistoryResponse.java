package com.scorpanion.backend.dto;

import java.util.List;

public record GameSessionHistoryResponse(
	List<GameSessionHistoryItemResponse> gameSessionsHistoryItems,
	String nextCursor,
	boolean hasMore
) {

	public GameSessionHistoryResponse {
		gameSessionsHistoryItems = gameSessionsHistoryItems == null ? List.of() : List.copyOf(gameSessionsHistoryItems);
	}
}
