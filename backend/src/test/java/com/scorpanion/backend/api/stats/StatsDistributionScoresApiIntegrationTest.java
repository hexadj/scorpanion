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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StatsDistributionScoresApiIntegrationTest extends AbstractApiIntegrationTest {

	@Test
	void getDistributionScores_globalScope_returnsBuckets() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		saveSession(game, alice, 10);
		saveSession(game, alice, 50);
		saveSession(game, alice, 90);

		mockMvc.perform(get("/stats/distributions/scores")
				.param("scope", "global")
				.param("gameId", game.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.totalSampleSize").value(3))
			.andExpect(jsonPath("$.rows").isArray());
	}

	@Test
	void getDistributionScores_playerScope_returnsPlayerSpecificBuckets() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));
		saveSession(game, alice, 20);
		saveSession(game, alice, 40);
		saveSession(game, bob, 80);

		mockMvc.perform(get("/stats/distributions/scores")
				.param("scope", "player")
				.param("gameId", game.getId().toString())
				.param("playerId", alice.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalSampleSize").value(2))
			.andExpect(jsonPath("$.filters.playerId").value(alice.getId().toString()));
	}

	@Test
	void getDistributionScores_missingGameId_returnsMissingRequiredFilter() throws Exception {
		mockMvc.perform(get("/stats/distributions/scores")
				.param("scope", "global"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("MISSING_REQUIRED_FILTER"));
	}

	@Test
	void getDistributionScores_noScoreGame_returnsNoScoreUnsupported() throws Exception {
		GameEntity noScoreGame = gameRepository.save(new GameEntity("Hanabi", ResultType.NO_SCORE));

		mockMvc.perform(get("/stats/distributions/scores")
				.param("scope", "global")
				.param("gameId", noScoreGame.getId().toString()))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("NO_SCORE_UNSUPPORTED"));
	}

	@Test
	void getDistributionScores_playerScopeWithoutPlayerId_returnsMissingRequiredFilter() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));

		mockMvc.perform(get("/stats/distributions/scores")
				.param("scope", "player")
				.param("gameId", game.getId().toString()))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("MISSING_REQUIRED_FILTER"));
	}

	private void saveSession(GameEntity game, PlayerEntity player, int score) {
		GameSessionEntity session = new GameSessionEntity(game, Instant.now());
		session.addPlayerResult(new SessionPlayerResultEntity(player, score, 1, true));
		gameSessionRepository.save(session);
	}
}
