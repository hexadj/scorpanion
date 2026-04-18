package com.scorpanion.backend.service;

import com.scorpanion.backend.entity.GameSessionEntity;
import com.scorpanion.backend.service.command.CreateGameSessionCommand;
import com.scorpanion.backend.service.command.ListGameSessionsCommand;
import com.scorpanion.backend.service.result.GameSessionHistoryPage;

public interface GameSessionService {

	GameSessionEntity create(CreateGameSessionCommand command);

	GameSessionHistoryPage listHistory(ListGameSessionsCommand command);
}
