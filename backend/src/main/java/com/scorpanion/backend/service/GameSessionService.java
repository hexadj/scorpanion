package com.scorpanion.backend.service;

import com.scorpanion.backend.entity.GameSessionEntity;
import com.scorpanion.backend.service.command.CreateGameSessionCommand;

public interface GameSessionService {

	GameSessionEntity create(CreateGameSessionCommand command);
}
