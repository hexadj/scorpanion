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

class StatsRankingsApiIntegrationTest extends AbstractApiIntegrationTest {

	private static final UUID UNKNOWN_GAME_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

	@Test
	void getRankings_winRate_returnsPlayersRanked() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));

		// Alice: 2/2 wins (100%), Bob: 1/2 wins (50%)
		saveSession(game, alice, 30, 1, true);
		saveSession(game, alice, 25, 1, true);
		saveSession(game, bob, 20, 1, true);
		saveSession(game, bob, 15, 2, false);

		mockMvc.perform(get("/stats/rankings/players")
				.param("metric", "winRate"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.rows.length()").value(2))
			.andExpect(jsonPath("$.rows[0].player.name").value("Alice"))
			.andExpect(jsonPath("$.rows[0].hasValue").value(true))
			.andExpect(jsonPath("$.rows[1].player.name").value("Bob"))
			.andExpect(jsonPath("$.paging.total").value(2));
	}

	@Test
	void getRankings_averageScore_withGameId_returnsRankedScores() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));

		// Alice average: (50+40)/2 = 45, Bob average: (30+20)/2 = 25
		saveSession(game, alice, 50, 1, true);
		saveSession(game, alice, 40, 1, true);
		saveSession(game, bob, 30, 1, true);
		saveSession(game, bob, 20, 1, true);

		mockMvc.perform(get("/stats/rankings/players")
				.param("metric", "averageScore")
				.param("gameId", game.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.rows.length()").value(2))
			.andExpect(jsonPath("$.rows[0].player.name").value("Alice"))
			.andExpect(jsonPath("$.rows[0].value").value(45));
	}

	@Test
	void getRankings_pagination_returnsCorrectPage() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		PlayerEntity bob = playerRepository.save(new PlayerEntity("Bob"));
		saveSession(game, alice, 10, 1, true);
		saveSession(game, bob, 5, 2, false);

		mockMvc.perform(get("/stats/rankings/players")
				.param("metric", "winCount")
				.param("limit", "1")
				.param("offset", "0"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.rows.length()").value(1))
			.andExpect(jsonPath("$.paging.limit").value(1))
			.andExpect(jsonPath("$.paging.offset").value(0))
			.andExpect(jsonPath("$.paging.total").value(2));
	}

	@Test
	void getRankings_sessionCountMetric_returnsUnsupportedCombination() throws Exception {
		mockMvc.perform(get("/stats/rankings/players")
				.param("metric", "sessionCount"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("UNSUPPORTED_METRIC_SCOPE_COMBINATION"));
	}

	@Test
	void getRankings_averageScoreWithoutGameId_returnsMissingRequiredFilter() throws Exception {
		mockMvc.perform(get("/stats/rankings/players")
				.param("metric", "averageScore"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("MISSING_REQUIRED_FILTER"));
	}

	@Test
	void getRankings_averageScoreOnNoScoreGame_returnsNoScoreUnsupported() throws Exception {
		GameEntity noScoreGame = gameRepository.save(new GameEntity("Hanabi", ResultType.NO_SCORE));

		mockMvc.perform(get("/stats/rankings/players")
				.param("metric", "averageScore")
				.param("gameId", noScoreGame.getId().toString()))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("NO_SCORE_UNSUPPORTED"));
	}

	@Test
	void getRankings_nonExistentGameId_returnsNotFound() throws Exception {
		mockMvc.perform(get("/stats/rankings/players")
				.param("metric", "averageScore")
				.param("gameId", UNKNOWN_GAME_ID.toString()))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.title").value("RESOURCE_NOT_FOUND"))
			.andExpect(jsonPath("$.subCode").value("GAME_NOT_FOUND"));
	}

	@Test
	void getRankings_limitZero_returnsParameterValidationFailed() throws Exception {
		mockMvc.perform(get("/stats/rankings/players")
				.param("metric", "winCount")
				.param("limit", "0"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("PARAMETER_VALIDATION_FAILED"));
	}

	private void saveSession(GameEntity game, PlayerEntity player, int score, int rank, boolean isWinner) {
		GameSessionEntity session = new GameSessionEntity(game, Instant.now());
		session.addPlayerResult(new SessionPlayerResultEntity(player, score, rank, isWinner));
		gameSessionRepository.save(session);
	}
}


