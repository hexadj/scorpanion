package com.scorpanion.backend;

import com.scorpanion.backend.shared.support.AbstractPostgresTestContainer;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests extends AbstractPostgresTestContainer {

	@Test
	void contextLoads() {
	}

}


