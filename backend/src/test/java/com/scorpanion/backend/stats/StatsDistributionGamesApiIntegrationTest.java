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

class StatsDistributionGamesApiIntegrationTest extends AbstractApiIntegrationTest {

	private static final UUID UNKNOWN_PLAYER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

	@Test
	void getDistributionGames_globalScope_returnsTotalSessionCount() throws Exception {
		GameEntity azul = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		GameEntity hanabi = gameRepository.save(new GameEntity("Hanabi", ResultType.NO_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));

		saveSession(azul, alice);
		saveSession(azul, alice);
		saveSession(azul, alice);
		saveSession(hanabi, alice);

		mockMvc.perform(get("/stats/distributions/games")
				.param("scope", "global"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.totalSessionCount").value(4))
			.andExpect(jsonPath("$.rows").isArray());
	}

	@Test
	void getDistributionGames_playerScope_returnsPlayerSpecificDistribution() throws Exception {
		GameEntity azul = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		GameEntity hanabi = gameRepository.save(new GameEntity("Hanabi", ResultType.NO_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));

		saveSession(azul, alice);
		saveSession(azul, alice);
		saveSession(hanabi, bob);

		mockMvc.perform(get("/stats/distributions/games")
				.param("scope", "player")
				.param("playerId", alice.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalSessionCount").value(2))
			.andExpect(jsonPath("$.filters.playerId").value(alice.getId().toString()));
	}

	@Test
	void getDistributionGames_gameScope_returnsUnsupportedCombination() throws Exception {
		mockMvc.perform(get("/stats/distributions/games")
				.param("scope", "game"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("UNSUPPORTED_METRIC_SCOPE_COMBINATION"));
	}

	@Test
	void getDistributionGames_playerScopeWithoutPlayerId_returnsMissingRequiredFilter() throws Exception {
		mockMvc.perform(get("/stats/distributions/games")
				.param("scope", "player"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("MISSING_REQUIRED_FILTER"));
	}

	@Test
	void getDistributionGames_nonExistentPlayerId_returnsNotFound() throws Exception {
		mockMvc.perform(get("/stats/distributions/games")
				.param("scope", "player")
				.param("playerId", UNKNOWN_PLAYER_ID.toString()))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.title").value("RESOURCE_NOT_FOUND"))
			.andExpect(jsonPath("$.subCode").value("PLAYER_NOT_FOUND"));
	}

	private void saveSession(GameEntity game, PlayerEntity player) {
		GameSessionEntity session = new GameSessionEntity(game, Instant.now());
		session.addPlayerResult(new SessionPlayerResultEntity(player, 0, 1, true));
		gameSessionRepository.save(session);
	}
}


