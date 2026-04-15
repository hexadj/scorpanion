package com.scorpanion.backend;

import com.scorpanion.backend.support.AbstractPostgresMigrationTestContainer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("migration-test")
class BackendApplicationMigrationTest extends AbstractPostgresMigrationTestContainer {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void flywaySchemaHistoryTableIsCreated() {
		Integer historyRows = jdbcTemplate.queryForObject(
			"SELECT COUNT(*) FROM flyway_schema_history",
			Integer.class
		);

		assertThat(historyRows).isNotNull();
	}
}
