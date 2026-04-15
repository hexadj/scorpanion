package com.scorpanion.backend.dto;

import com.scorpanion.backend.entity.ResultType;

import java.util.UUID;

public record GameResponse(
	UUID id,
	String name,
	ResultType resultType
) {
}
