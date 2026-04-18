package com.scorpanion.backend.api.support;

import com.scorpanion.backend.repository.GameRepository;
import com.scorpanion.backend.repository.GameSessionRepository;
import com.scorpanion.backend.repository.PlayerRepository;
import com.scorpanion.backend.repository.SessionPlayerResultRepository;
import com.scorpanion.backend.support.AbstractPostgresTestContainer;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public abstract class AbstractApiIntegrationTest extends AbstractPostgresTestContainer {

	@Autowired
	protected MockMvc mockMvc;

	@Autowired
	protected GameRepository gameRepository;

	@Autowired
	protected PlayerRepository playerRepository;

	@Autowired
	protected GameSessionRepository gameSessionRepository;

	@Autowired
	protected SessionPlayerResultRepository sessionPlayerResultRepository;

	@BeforeEach
	void cleanDatabase() {
		sessionPlayerResultRepository.deleteAll();
		gameSessionRepository.deleteAll();
		playerRepository.deleteAll();
		gameRepository.deleteAll();
	}
}
