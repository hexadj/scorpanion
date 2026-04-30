package com.scorpanion.backend.player.dto;

import java.util.UUID;

public record PlayerResponse(
	UUID id,
	String name
) {
}


