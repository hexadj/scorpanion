package com.scorpanion.backend.dto;

import com.scorpanion.backend.model.ResultType;

import java.util.UUID;

public record GameResponse(
	UUID id,
	String name,
	ResultType resultType
) {
}
