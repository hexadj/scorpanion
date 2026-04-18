package com.scorpanion.backend.api;

import com.scorpanion.backend.api.support.AbstractApiIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(ApiErrorContractIntegrationTest.TestErrorController.class)
class ApiErrorContractIntegrationTest extends AbstractApiIntegrationTest {

	@Test
	void malformedJsonReturnsExpectedProblemDetail() throws Exception {
		mockMvc.perform(
			post("/games")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{")
		)
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
			.andExpect(jsonPath("$.title").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.subCode").value("MALFORMED_JSON"))
			.andExpect(jsonPath("$.detail").value("Malformed request body."));
	}

	@Test
	void resourceNotFoundReturnsExpectedProblemDetail() throws Exception {
		mockMvc.perform(
			post("/game-sessions")
				.contentType(MediaType.APPLICATION_JSON)
				.content(
					"""
					{
					  "gameId": "00000000-0000-0000-0000-000000000001",
					  "playedAt": "2026-04-18T20:30:00Z",
					  "playerResults": [
					    {
					      "playerId": "00000000-0000-0000-0000-000000000002",
					      "score": 42,
					      "rank": 1,
					      "isWinner": true
					    }
					  ]
					}
					"""
				)
		)
			.andExpect(status().isNotFound())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
			.andExpect(jsonPath("$.title").value("RESOURCE_NOT_FOUND"))
			.andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
			.andExpect(jsonPath("$.subCode").value("GAME_NOT_FOUND"))
			.andExpect(jsonPath("$.detail").value("Requested resource was not found."));
	}

	@Test
	void invalidParameterTypeReturnsExpectedProblemDetail() throws Exception {
		mockMvc.perform(get("/_test-errors/type-mismatch/not-a-uuid"))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
			.andExpect(jsonPath("$.title").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
			.andExpect(jsonPath("$.subCode").value("INVALID_PARAMETER_TYPE"))
			.andExpect(jsonPath("$.detail").value("Invalid parameter type."));
	}

	@Test
	void unexpectedExceptionReturnsExpectedProblemDetail() throws Exception {
		mockMvc.perform(get("/_test-errors/unexpected"))
			.andExpect(status().isInternalServerError())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
			.andExpect(jsonPath("$.title").value("INTERNAL_ERROR"))
			.andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
			.andExpect(jsonPath("$.subCode").value("UNEXPECTED_ERROR"))
			.andExpect(jsonPath("$.detail").value("An unexpected error occurred."));
	}

	@RestController
	@RequestMapping("/_test-errors")
	static class TestErrorController {

		@GetMapping("/type-mismatch/{id}")
		void typeMismatch(@PathVariable UUID id) {
			// Endpoint exists only to trigger conversion failures in API error-contract tests.
		}

		@GetMapping("/unexpected")
		void unexpectedFailure() {
			throw new IllegalStateException("Unexpected error for contract test");
		}
	}
}
