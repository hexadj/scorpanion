package com.scorpanion.backend.stats;

import com.scorpanion.backend.shared.support.AbstractApiIntegrationTest;
import com.scorpanion.backend.game.GameEntity;
import com.scorpanion.backend.session.GameSessionEntity;
import com.scorpanion.backend.player.PlayerEntity;
import com.scorpanion.backend.session.SessionPlayerResultEntity;
import com.scorpanion.backend.model.ResultType;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StatsDistributionWinsApiIntegrationTest extends AbstractApiIntegrationTest {

	private static final UUID UNKNOWN_GAME_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

	@Test
	void getDistributionWins_globalScope_returnsFixedBuckets() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));
		PlayerEntity charlie = playerRepository.save(new PlayerEntity("Charlie"));

		// Alice: 1 win, Bob: 2 wins, Charlie: 0 wins
		saveSession(game, alice, true);
		saveSession(game, bob, true);
		saveSession(game, bob, true);
		saveSession(game, charlie, false);

		mockMvc.perform(get("/stats/distributions/wins")
				.param("scope", "global"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.totalPlayerCount").value(3))
			.andExpect(jsonPath("$.rows.length()").value(4));
	}

	@Test
	void getDistributionWins_gameScope_returnsGameSpecificDistribution() throws Exception {
		GameEntity game1 = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		GameEntity game2 = gameRepository.save(new GameEntity("Hanabi", ResultType.NO_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));

		saveSession(game1, alice, true);
		saveSession(game2, bob, false);

		mockMvc.perform(get("/stats/distributions/wins")
				.param("scope", "game")
				.param("gameId", game1.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalPlayerCount").value(1))
			.andExpect(jsonPath("$.rows.length()").value(4))
			.andExpect(jsonPath("$.filters.gameId").value(game1.getId().toString()));
	}

	@Test
	void getDistributionWins_playerScope_returnsUnsupportedCombination() throws Exception {
		mockMvc.perform(get("/stats/distributions/wins")
				.param("scope", "player"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("UNSUPPORTED_METRIC_SCOPE_COMBINATION"));
	}

	@Test
	void getDistributionWins_gameScopeWithoutGameId_returnsMissingRequiredFilter() throws Exception {
		mockMvc.perform(get("/stats/distributions/wins")
				.param("scope", "game"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("MISSING_REQUIRED_FILTER"));
	}

	@Test
	void getDistributionWins_nonExistentGameId_returnsNotFound() throws Exception {
		mockMvc.perform(get("/stats/distributions/wins")
				.param("scope", "game")
				.param("gameId", UNKNOWN_GAME_ID.toString()))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.title").value("RESOURCE_NOT_FOUND"))
			.andExpect(jsonPath("$.subCode").value("GAME_NOT_FOUND"));
	}

	private void saveSession(GameEntity game, PlayerEntity player, boolean isWinner) {
		GameSessionEntity session = new GameSessionEntity(game, Instant.now());
		session.addPlayerResult(new SessionPlayerResultEntity(player, 0, 1, isWinner));
		gameSessionRepository.save(session);
	}
}


