package com.scorpanion.backend.api.stats;

import com.scorpanion.backend.api.support.AbstractApiIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StatsCatalogApiIntegrationTest extends AbstractApiIntegrationTest {

	@Test
	void getCatalog_returnsSupportedCapabilities() throws Exception {
		mockMvc.perform(get("/stats/catalog"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.supportedIntervals").isArray())
			.andExpect(jsonPath("$.supportedIntervals.length()").value(4))
			.andExpect(jsonPath("$.supportedScopes").isArray())
			.andExpect(jsonPath("$.supportedScopes.length()").value(3))
			.andExpect(jsonPath("$.metrics").isArray())
			.andExpect(jsonPath("$.metrics.length()").value(10));
	}
}
