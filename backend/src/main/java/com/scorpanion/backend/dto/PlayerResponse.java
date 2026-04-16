package com.scorpanion.backend.dto;

import java.util.UUID;

public record PlayerResponse(
	UUID id,
	String name
) {
}
