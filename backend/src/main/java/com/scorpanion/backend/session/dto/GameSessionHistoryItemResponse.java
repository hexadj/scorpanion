package com.scorpanion.backend.session.dto;

import java.time.Instant;
import java.util.UUID;

public record GameSessionHistoryItemResponse(
    UUID id,
    Instant playedAt,
    String gameName,
    Integer playerCount
) {

    public GameSessionHistoryItemResponse {
        playerCount = playerCount == null ? 0 : playerCount;
    }
}

