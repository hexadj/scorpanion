package com.scorpanion.backend.session;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.scorpanion.backend.shared.support.AbstractApiIntegrationTest;
import com.scorpanion.backend.game.GameEntity;
import com.scorpanion.backend.player.PlayerEntity;
import com.scorpanion.backend.model.ResultType;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GameSessionHistoryApiIntegrationTest extends AbstractApiIntegrationTest {

	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

	@Test
	void getGameSessionsReturnsFirstPageWithNextCursorAndHasMore() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity player = playerRepository.save(new PlayerEntity("Alice"));

		saveGameSession(game, player, Instant.parse("2026-04-18T20:00:00Z"), 10);
		GameSessionEntity middle = saveGameSession(game, player, Instant.parse("2026-04-18T20:10:00Z"), 20);
		GameSessionEntity newest = saveGameSession(game, player, Instant.parse("2026-04-18T20:20:00Z"), 30);

		mockMvc.perform(get("/game-sessions?limit=2"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.gameSessionsHistoryItems.length()").value(2))
			.andExpect(jsonPath("$.gameSessionsHistoryItems[0].id").value(newest.getId().toString()))
			.andExpect(jsonPath("$.gameSessionsHistoryItems[1].id").value(middle.getId().toString()))
			.andExpect(jsonPath("$.hasMore").value(true))
			.andExpect(jsonPath("$.nextCursor").isNotEmpty());
	}

	@Test
	void getGameSessionsWithCursorReturnsNextPageWithoutDuplicates() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity player = playerRepository.save(new PlayerEntity("Alice"));

		GameSessionEntity oldest = saveGameSession(game, player, Instant.parse("2026-04-18T20:00:00Z"), 10);
		saveGameSession(game, player, Instant.parse("2026-04-18T20:10:00Z"), 20);
		saveGameSession(game, player, Instant.parse("2026-04-18T20:20:00Z"), 30);

		MvcResult firstPage = mockMvc.perform(get("/game-sessions?limit=2"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.gameSessionsHistoryItems.length()").value(2))
			.andExpect(jsonPath("$.hasMore").value(true))
			.andReturn();

		JsonNode firstPageBody = OBJECT_MAPPER.readTree(firstPage.getResponse().getContentAsString());
		String nextCursor = firstPageBody.path("nextCursor").asText();
		Set<String> firstPageIds = new HashSet<>();
		firstPageIds.add(firstPageBody.path("gameSessionsHistoryItems").get(0).path("id").asText());
		firstPageIds.add(firstPageBody.path("gameSessionsHistoryItems").get(1).path("id").asText());

		MvcResult secondPage = mockMvc.perform(
			get("/game-sessions")
				.param("limit", "2")
				.param("cursor", nextCursor)
		)
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.gameSessionsHistoryItems.length()").value(1))
			.andExpect(jsonPath("$.hasMore").value(false))
			.andExpect(jsonPath("$.nextCursor").isEmpty())
			.andReturn();

		JsonNode secondPageBody = OBJECT_MAPPER.readTree(secondPage.getResponse().getContentAsString());
		String secondPageId = secondPageBody.path("gameSessionsHistoryItems").get(0).path("id").asText();

		assertThat(secondPageId).isEqualTo(oldest.getId().toString());
		assertThat(firstPageIds).doesNotContain(secondPageId);
	}

	@Test
	void getGameSessionsWithCombinedFiltersReturnsOnlyMatchingSessions() throws Exception {
		GameEntity game1 = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		GameEntity game2 = gameRepository.save(new GameEntity("Hanabi", ResultType.NO_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));

		GameSessionEntity expected = saveGameSession(game1, alice, Instant.parse("2026-04-18T20:30:00Z"), 42);
		saveGameSession(game2, alice, Instant.parse("2026-04-18T20:20:00Z"), 35);
		saveGameSession(game1, bob, Instant.parse("2026-04-18T20:10:00Z"), 28);

		mockMvc.perform(
			get("/game-sessions")
				.param("gameIds", game1.getId().toString())
				.param("playerIds", alice.getId().toString())
				.param("limit", "20")
		)
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.gameSessionsHistoryItems.length()").value(1))
			.andExpect(jsonPath("$.gameSessionsHistoryItems[0].id").value(expected.getId().toString()))
			.andExpect(jsonPath("$.hasMore").value(false))
			.andExpect(jsonPath("$.nextCursor").isEmpty());
	}

	@Test
	void getGameSessionsWithInvalidLimitReturnsParameterValidationProblemDetail() throws Exception {
		mockMvc.perform(get("/game-sessions?limit=0"))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
			.andExpect(jsonPath("$.title").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.subCode").value("PARAMETER_VALIDATION_FAILED"))
			.andExpect(jsonPath("$.detail").value("Request parameter validation failed."));
	}

	@Test
	void getGameSessionsWithInvalidCursorReturnsInvalidCursorProblemDetail() throws Exception {
		mockMvc.perform(get("/game-sessions?cursor=not-a-valid-cursor"))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
			.andExpect(jsonPath("$.title").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.subCode").value("INVALID_CURSOR"))
			.andExpect(jsonPath("$.detail").value("Request parameter validation failed."));
	}

	private GameSessionEntity saveGameSession(GameEntity game, PlayerEntity player, Instant playedAt, int score) {
		GameSessionEntity gameSession = new GameSessionEntity(game, playedAt);
		gameSession.addPlayerResult(new SessionPlayerResultEntity(player, score, 1, true));
		return gameSessionRepository.save(gameSession);
	}
}


