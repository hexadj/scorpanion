package com.scorpanion.backend.game;

import com.scorpanion.backend.shared.support.AbstractApiIntegrationTest;
import com.scorpanion.backend.model.ResultType;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GameApiIntegrationTest extends AbstractApiIntegrationTest {

	@Test
	void postGamesWithInvalidPayloadReturnsProblemDetailContract() throws Exception {
		mockMvc.perform(
			post("/games")
				.contentType(MediaType.APPLICATION_JSON)
				.content(
					"""
					{
					  "name": "   ",
					  "resultType": "HIGHEST_SCORE"
					}
					"""
				)
		)
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
			.andExpect(jsonPath("$.title").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.subCode").value("PAYLOAD_VALIDATION_FAILED"))
			.andExpect(jsonPath("$.detail").value("Request payload validation failed."))
			.andExpect(jsonPath("$.fieldErrors", hasItem("name: must not be blank")));
	}

	@Test
	void getGamesReturnsListSortedByName() throws Exception {
		gameRepository.save(new GameEntity("Zulu", ResultType.LOWEST_SCORE));
		gameRepository.save(new GameEntity("Azul", ResultType.HIGHEST_SCORE));

		mockMvc.perform(get("/games"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.length()").value(2))
			.andExpect(jsonPath("$[0].name").value("Azul"))
			.andExpect(jsonPath("$[0].resultType").value("HIGHEST_SCORE"))
			.andExpect(jsonPath("$[1].name").value("Zulu"))
			.andExpect(jsonPath("$[1].resultType").value("LOWEST_SCORE"));
	}
}


