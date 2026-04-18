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

	@Test
	void schemaContainsExpectedBusinessConstraintsAndIndexes() {
		assertConstraintExists("game", "ck_game_result_type", "c");
		assertConstraintExists("game_session", "fk_game_session_game", "f");
		assertConstraintExists("session_player_result", "uk_session_player_result_session_player", "u");
		assertConstraintExists("session_player_result", "fk_session_player_result_game_session", "f");
		assertConstraintExists("session_player_result", "fk_session_player_result_player", "f");

		assertIndexExists("game", "uk_game_name_ci_trim");
		assertIndexExists("player", "uk_player_name_ci_trim");
		assertIndexExists("game_session", "idx_game_session_game_id");
		assertIndexExists("session_player_result", "idx_session_player_result_player_id");

		assertIndexDefinitionContains("game", "uk_game_name_ci_trim", "lower");
		assertIndexDefinitionContains("game", "uk_game_name_ci_trim", "btrim");
		assertIndexDefinitionContains("player", "uk_player_name_ci_trim", "lower");
		assertIndexDefinitionContains("player", "uk_player_name_ci_trim", "btrim");
	}

	private void assertConstraintExists(String tableName, String constraintName, String constraintType) {
		Integer count = jdbcTemplate.queryForObject(
			"""
				SELECT COUNT(*)
				FROM pg_constraint constraint_def
				JOIN pg_class table_def ON table_def.oid = constraint_def.conrelid
				JOIN pg_namespace schema_def ON schema_def.oid = table_def.relnamespace
				WHERE schema_def.nspname = current_schema()
				  AND table_def.relname = ?
				  AND constraint_def.conname = ?
				  AND constraint_def.contype = ?
				""",
			Integer.class,
			tableName,
			constraintName,
			constraintType
		);

		assertThat(count)
			.as("Expected constraint %s on table %s", constraintName, tableName)
			.isEqualTo(1);
	}

	private void assertIndexExists(String tableName, String indexName) {
		Integer count = jdbcTemplate.queryForObject(
			"""
				SELECT COUNT(*)
				FROM pg_indexes
				WHERE schemaname = current_schema()
				  AND tablename = ?
				  AND indexname = ?
				""",
			Integer.class,
			tableName,
			indexName
		);

		assertThat(count)
			.as("Expected index %s on table %s", indexName, tableName)
			.isEqualTo(1);
	}

	private void assertIndexDefinitionContains(String tableName, String indexName, String expectedFragment) {
		String indexDefinition = jdbcTemplate.queryForObject(
			"""
				SELECT indexdef
				FROM pg_indexes
				WHERE schemaname = current_schema()
				  AND tablename = ?
				  AND indexname = ?
				""",
			String.class,
			tableName,
			indexName
		);

		assertThat(indexDefinition)
			.as("Expected index definition for %s to contain %s", indexName, expectedFragment)
			.isNotNull()
			.containsIgnoringCase(expectedFragment);
	}
}
