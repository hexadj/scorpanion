package com.scorpanion.backend.stats.repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

final class RepositoryUtils {

	private RepositoryUtils() {
	}

	static UUID toUuid(Object value) {
		if (value == null) {
			throw new IllegalStateException("Unexpected NULL for UUID column");
		}
		if (value instanceof UUID uuid) {
			return uuid;
		}
		return UUID.fromString(value.toString());
	}

	static Long toLong(Object value) {
		if (value == null) {
			return 0L;
		}
		if (value instanceof Long l) {
			return l;
		}
		if (value instanceof BigDecimal bd) {
			return bd.longValue();
		}
		return ((Number) value).longValue();
	}

	static Long toLongOrNull(Object value) {
		if (value == null) {
			return null;
		}
		if (value instanceof Long l) {
			return l;
		}
		if (value instanceof BigDecimal bd) {
			return bd.longValue();
		}
		return ((Number) value).longValue();
	}

	static int toInt(Object value) {
		if (value == null) {
			throw new IllegalStateException("Unexpected NULL for int column");
		}
		if (value instanceof Integer i) {
			return i;
		}
		if (value instanceof Long l) {
			return l.intValue();
		}
		if (value instanceof BigDecimal bd) {
			return bd.intValue();
		}
		return ((Number) value).intValue();
	}

	static Instant toInstant(Object value) {
		if (value instanceof Instant i) {
			return i;
		}
		if (value instanceof java.sql.Timestamp ts) {
			return ts.toInstant();
		}
		if (value instanceof java.time.OffsetDateTime odt) {
			return odt.toInstant();
		}
		if (value instanceof java.time.ZonedDateTime zdt) {
			return zdt.toInstant();
		}
		if (value instanceof java.time.LocalDateTime ldt) {
			return ldt.toInstant(java.time.ZoneOffset.UTC);
		}
		throw new IllegalStateException("Unsupported temporal type for Instant conversion: " + value.getClass());
	}
}


