package com.scorpanion.backend.service;

import java.util.UUID;

import com.scorpanion.backend.entity.GameSessionEntity;
import com.scorpanion.backend.service.command.CreateGameSessionCommand;
import com.scorpanion.backend.service.command.ListGameSessionsCommand;
import com.scorpanion.backend.service.result.GameSessionHistoryPage;

public interface GameSessionService {

	GameSessionEntity get(UUID id);

	GameSessionEntity create(CreateGameSessionCommand command);

	GameSessionHistoryPage listHistory(ListGameSessionsCommand command);
}
