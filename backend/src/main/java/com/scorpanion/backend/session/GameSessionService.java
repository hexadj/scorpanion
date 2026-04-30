package com.scorpanion.backend.session;

import java.util.UUID;

import com.scorpanion.backend.session.command.CreateGameSessionCommand;
import com.scorpanion.backend.session.command.ListGameSessionsCommand;
import com.scorpanion.backend.session.dto.GameSessionHistoryPage;

public interface GameSessionService {

	GameSessionEntity get(UUID id);

	GameSessionEntity create(CreateGameSessionCommand command);

	GameSessionHistoryPage listHistory(ListGameSessionsCommand command);
}


