package com.scorpanion.backend.api;

import com.scorpanion.backend.api.support.AbstractApiIntegrationTest;
import com.scorpanion.backend.entity.PlayerEntity;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PlayerApiIntegrationTest extends AbstractApiIntegrationTest {

	@Test
	void getPlayersReturnsListSortedByName() throws Exception {
		playerRepository.save(new PlayerEntity("Zoey"));
		playerRepository.save(new PlayerEntity("Alice"));

		mockMvc.perform(get("/players"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.length()").value(2))
			.andExpect(jsonPath("$[0].name").value("Alice"))
			.andExpect(jsonPath("$[1].name").value("Zoey"));
	}

	@Test
	void postPlayersCreatesPlayerAndReturnsTrimmedName() throws Exception {
		mockMvc.perform(
			post("/players")
				.contentType(MediaType.APPLICATION_JSON)
				.content(
					"""
					{
					  "name": "  Alice  "
					}
					"""
				)
		)
			.andExpect(status().isCreated())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.id").isNotEmpty())
			.andExpect(jsonPath("$.name").value("Alice"));

		assertThat(playerRepository.count()).isEqualTo(1);
		assertThat(playerRepository.findAll().getFirst().getName()).isEqualTo("Alice");
	}
}
