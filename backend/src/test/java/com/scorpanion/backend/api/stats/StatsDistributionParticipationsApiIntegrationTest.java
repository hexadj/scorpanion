package com.scorpanion.backend.api.stats;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StatsDistributionParticipationsApiIntegrationTest extends AbstractApiIntegrationTest {

	private static final UUID UNKNOWN_GAME_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

	@Test
	void getDistributionParticipations_globalScope_returnsFixedBuckets() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));
		PlayerEntity charlie = playerRepository.save(new PlayerEntity("Charlie"));

		// Alice: 7 participations (→ "7+" bucket), Bob: 3 (→ "2-3"), Charlie: 1 (→ "1")
		for (int i = 0; i < 7; i++) saveSession(game, alice);
		for (int i = 0; i < 3; i++) saveSession(game, bob);
		saveSession(game, charlie);

		mockMvc.perform(get("/stats/distributions/participations")
				.param("scope", "global"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.totalPlayerCount").value(3))
			.andExpect(jsonPath("$.rows.length()").value(4));
	}

	@Test
	void getDistributionParticipations_gameScope_returnsGameSpecificDistribution() throws Exception {
		GameEntity game1 = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		GameEntity game2 = gameRepository.save(new GameEntity("Hanabi", ResultType.NO_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));

		saveSession(game1, alice);
		saveSession(game2, bob);

		mockMvc.perform(get("/stats/distributions/participations")
				.param("scope", "game")
				.param("gameId", game1.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalPlayerCount").value(1))
			.andExpect(jsonPath("$.rows.length()").value(4))
			.andExpect(jsonPath("$.filters.gameId").value(game1.getId().toString()));
	}

	@Test
	void getDistributionParticipations_playerScope_returnsUnsupportedCombination() throws Exception {
		mockMvc.perform(get("/stats/distributions/participations")
				.param("scope", "player"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("UNSUPPORTED_METRIC_SCOPE_COMBINATION"));
	}

	@Test
	void getDistributionParticipations_gameScopeWithoutGameId_returnsMissingRequiredFilter() throws Exception {
		mockMvc.perform(get("/stats/distributions/participations")
				.param("scope", "game"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("MISSING_REQUIRED_FILTER"));
	}

	@Test
	void getDistributionParticipations_nonExistentGameId_returnsNotFound() throws Exception {
		mockMvc.perform(get("/stats/distributions/participations")
				.param("scope", "game")
				.param("gameId", UNKNOWN_GAME_ID.toString()))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.title").value("RESOURCE_NOT_FOUND"))
			.andExpect(jsonPath("$.subCode").value("GAME_NOT_FOUND"));
	}

	private void saveSession(GameEntity game, PlayerEntity player) {
		GameSessionEntity session = new GameSessionEntity(game, Instant.now());
		session.addPlayerResult(new SessionPlayerResultEntity(player, 0, 1, true));
		gameSessionRepository.save(session);
	}
}
