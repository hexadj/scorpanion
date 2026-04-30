package com.scorpanion.backend.game.dto;

import java.util.UUID;

import com.scorpanion.backend.model.ResultType;

public record GameResponse(
	UUID id,
	String name,
	ResultType resultType
) {
}


