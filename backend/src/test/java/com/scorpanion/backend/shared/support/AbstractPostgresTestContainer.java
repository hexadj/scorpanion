package com.scorpanion.backend.shared.support;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
public abstract class AbstractPostgresTestContainer {

	@Container
	@ServiceConnection
	private static final PostgreSQLContainer<?> POSTGRES =
		PostgresContainerFactory.postgres("scorpanion_app_test");
}


