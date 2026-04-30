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

class StatsTimeseriesApiIntegrationTest extends AbstractApiIntegrationTest {

	private static final UUID UNKNOWN_PLAYER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

	@Test
	void getTimeseries_globalScope_sessionCount_returnsSeriesData() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		saveSession(game, Instant.now(), alice, 10, 1, true);
		saveSession(game, Instant.now(), alice, 20, 1, true);

		mockMvc.perform(get("/stats/timeseries")
				.param("metric", "sessionCount")
				.param("scope", "global")
				.param("interval", "week"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.metric").value("sessionCount"))
			.andExpect(jsonPath("$.scope").value("global"))
			.andExpect(jsonPath("$.interval").value("week"))
			.andExpect(jsonPath("$.series").isArray());
	}

	@Test
	void getTimeseries_playerScope_winCount_returnsPlayerFilteredData() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		playerRepository.save(new PlayerEntity("Bob"));
		saveSession(game, Instant.now(), alice, 10, 1, true);

		mockMvc.perform(get("/stats/timeseries")
				.param("metric", "winCount")
				.param("scope", "player")
				.param("interval", "month")
				.param("playerId", alice.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.metric").value("winCount"))
			.andExpect(jsonPath("$.scope").value("player"))
			.andExpect(jsonPath("$.filters.playerId").value(alice.getId().toString()))
			.andExpect(jsonPath("$.series").isArray());
	}

	@Test
	void getTimeseries_gameScope_averageScore_returnsData() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));
		saveSession(game, Instant.now(), alice, 10, 1, true);
		saveSession(game, Instant.now(), alice, 30, 1, true);

		mockMvc.perform(get("/stats/timeseries")
				.param("metric", "averageScore")
				.param("scope", "game")
				.param("interval", "week")
				.param("gameId", game.getId().toString()))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.metric").value("averageScore"))
			.andExpect(jsonPath("$.scope").value("game"))
			.andExpect(jsonPath("$.filters.gameId").value(game.getId().toString()))
			.andExpect(jsonPath("$.series").isArray());
	}

	@Test
	void getTimeseries_playerScopeWithoutPlayerId_returnsMissingRequiredFilter() throws Exception {
		mockMvc.perform(get("/stats/timeseries")
				.param("metric", "winCount")
				.param("scope", "player")
				.param("interval", "week"))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
			.andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.subCode").value("MISSING_REQUIRED_FILTER"));
	}

	@Test
	void getTimeseries_gameScopeWithoutGameId_returnsMissingRequiredFilter() throws Exception {
		mockMvc.perform(get("/stats/timeseries")
				.param("metric", "sessionCount")
				.param("scope", "game")
				.param("interval", "week"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("MISSING_REQUIRED_FILTER"));
	}

	@Test
	void getTimeseries_averageScoreWithoutGameId_returnsMissingRequiredFilter() throws Exception {
		PlayerEntity alice = playerRepository.save(new PlayerEntity("Alice"));

		mockMvc.perform(get("/stats/timeseries")
				.param("metric", "averageScore")
				.param("scope", "player")
				.param("interval", "week")
				.param("playerId", alice.getId().toString()))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("MISSING_REQUIRED_FILTER"));
	}

	@Test
	void getTimeseries_scoreMetricOnNoScoreGame_returnsNoScoreUnsupported() throws Exception {
		GameEntity noScoreGame = gameRepository.save(new GameEntity("Hanabi", ResultType.NO_SCORE));

		mockMvc.perform(get("/stats/timeseries")
				.param("metric", "averageScore")
				.param("scope", "game")
				.param("interval", "week")
				.param("gameId", noScoreGame.getId().toString()))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("NO_SCORE_UNSUPPORTED"));
	}

	@Test
	void getTimeseries_winCountWithGlobalScope_returnsUnsupportedCombination() throws Exception {
		mockMvc.perform(get("/stats/timeseries")
				.param("metric", "winCount")
				.param("scope", "global")
				.param("interval", "week"))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.subCode").value("UNSUPPORTED_METRIC_SCOPE_COMBINATION"));
	}

	@Test
	void getTimeseries_nonExistentPlayerId_returnsNotFound() throws Exception {
		mockMvc.perform(get("/stats/timeseries")
				.param("metric", "winCount")
				.param("scope", "player")
				.param("interval", "week")
				.param("playerId", UNKNOWN_PLAYER_ID.toString()))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.title").value("RESOURCE_NOT_FOUND"))
			.andExpect(jsonPath("$.subCode").value("PLAYER_NOT_FOUND"));
	}

	private void saveSession(GameEntity game, Instant playedAt, PlayerEntity player, int score, int rank, boolean isWinner) {
		GameSessionEntity session = new GameSessionEntity(game, playedAt);
		session.addPlayerResult(new SessionPlayerResultEntity(player, score, rank, isWinner));
		gameSessionRepository.save(session);
	}
}
