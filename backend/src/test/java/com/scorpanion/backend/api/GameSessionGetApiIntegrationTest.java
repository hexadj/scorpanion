package com.scorpanion.backend.api;

import com.scorpanion.backend.api.support.AbstractApiIntegrationTest;
import com.scorpanion.backend.entity.GameEntity;
import com.scorpanion.backend.entity.GameSessionEntity;
import com.scorpanion.backend.entity.PlayerEntity;
import com.scorpanion.backend.entity.SessionPlayerResultEntity;
import com.scorpanion.backend.model.ResultType;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.hasItems;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GameSessionGetApiIntegrationTest extends AbstractApiIntegrationTest {

	@Test
	void getGameSessionReturnsSessionDetails() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));

		GameSessionEntity gameSession = new GameSessionEntity(game, Instant.parse("2026-04-18T20:30:00Z"));
		gameSession.addPlayerResult(new SessionPlayerResultEntity(alice, 42, 1, true));
		gameSession.addPlayerResult(new SessionPlayerResultEntity(bob, 38, 2, false));
		GameSessionEntity savedSession = gameSessionRepository.save(gameSession);

		mockMvc.perform(get("/game-sessions/{id}", savedSession.getId()))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.id").value(savedSession.getId().toString()))
			.andExpect(jsonPath("$.gameId").value(game.getId().toString()))
			.andExpect(jsonPath("$.gameName").value("Azul"))
			.andExpect(jsonPath("$.resultType").value("HIGHEST_SCORE"))
			.andExpect(jsonPath("$.playedAt").value("2026-04-18T20:30:00Z"))
			.andExpect(jsonPath("$.playerResults.length()").value(2))
			.andExpect(jsonPath("$.playerResults[*].playerId", hasItems(alice.getId().toString(), bob.getId().toString())))
			.andExpect(jsonPath("$.playerResults[*].playerName", hasItems("Alice", "Bob")))
			.andExpect(jsonPath("$.playerResults[*].rank", hasItems(1, 2)))
			.andExpect(jsonPath("$.playerResults[*].score", hasItems(42, 38)))
			.andExpect(jsonPath("$.playerResults[*].isWinner", hasItems(true, false)));
	}

	@Test
	void getGameSessionWithUnknownIdReturnsNotFoundProblemDetail() throws Exception {
		UUID unknownGameSessionId = UUID.randomUUID();

		mockMvc.perform(get("/game-sessions/{id}", unknownGameSessionId))
			.andExpect(status().isNotFound())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
			.andExpect(jsonPath("$.title").value("RESOURCE_NOT_FOUND"))
			.andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
			.andExpect(jsonPath("$.subCode").value("GAME_SESSION_NOT_FOUND"))
			.andExpect(jsonPath("$.detail").value("Requested resource was not found."));
	}
}
