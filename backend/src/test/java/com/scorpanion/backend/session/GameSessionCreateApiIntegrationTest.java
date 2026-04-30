package com.scorpanion.backend.session;

import com.scorpanion.backend.shared.support.AbstractApiIntegrationTest;
import com.scorpanion.backend.game.GameEntity;
import com.scorpanion.backend.player.PlayerEntity;
import com.scorpanion.backend.model.ResultType;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GameSessionCreateApiIntegrationTest extends AbstractApiIntegrationTest {

	@Test
	void createGameSessionWithDuplicatePlayersKeepsTransactionAtomic() throws Exception {
		GameEntity game = gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));
		PlayerEntity player = playerRepository.save(new PlayerEntity("Alice"));

		long sessionsBefore = gameSessionRepository.count();
		long resultsBefore = sessionPlayerResultRepository.count();

		String payload = """
			{
			  "gameId": "%s",
			  "playedAt": "2026-04-18T20:30:00Z",
			  "playerResults": [
			    {
			      "playerId": "%s",
			      "score": 42,
			      "rank": 1,
			      "isWinner": true
			    },
			    {
			      "playerId": "%s",
			      "score": 38,
			      "rank": 2,
			      "isWinner": false
			    }
			  ]
			}
			""".formatted(game.getId(), player.getId(), player.getId());

		mockMvc.perform(
			post("/game-sessions")
				.contentType(MediaType.APPLICATION_JSON)
				.content(payload)
		)
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.title").value("CONFLICT"))
			.andExpect(jsonPath("$.code").value("CONFLICT"))
			.andExpect(jsonPath("$.subCode").value("DUPLICATE_PLAYER_IN_SESSION"));

		assertThat(gameSessionRepository.count()).isEqualTo(sessionsBefore);
		assertThat(sessionPlayerResultRepository.count()).isEqualTo(resultsBefore);
	}
}


