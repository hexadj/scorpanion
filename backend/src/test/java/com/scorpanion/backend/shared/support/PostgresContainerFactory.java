package com.scorpanion.backend.shared.support;

import org.testcontainers.containers.PostgreSQLContainer;

final class PostgresContainerFactory {

	private PostgresContainerFactory() {
	}

	static PostgreSQLContainer<?> postgres(String databaseName) {
		return new PostgreSQLContainer<>("postgres:18-alpine")
			.withDatabaseName(databaseName)
			.withUsername("scorpanion")
			.withPassword("scorpanion");
	}
}


