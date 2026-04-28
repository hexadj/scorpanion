package com.scorpanion.backend.stats.model;

public enum Metric {

	SESSION_COUNT("sessionCount", true),
	PARTICIPATION_COUNT("participationCount", true),
	WIN_COUNT("winCount", true),
	WIN_RATE("winRate", false),
	AVERAGE_SCORE("averageScore", false),
	MIN_SCORE("minScore", false),
	MAX_SCORE("maxScore", false),
	AVERAGE_RANK("averageRank", false),
	PLAYED_GAME_COUNT("playedGameCount", true),
	ACTIVE_PLAYER_COUNT("activePlayerCount", true);

	private final String value;
	private final boolean counting;

	Metric(String value, boolean counting) {
		this.value = value;
		this.counting = counting;
	}

	public String getValue() {
		return value;
	}

	public boolean isCounting() {
		return counting;
	}

	public static Metric fromValue(String value) {
		for (Metric metric : values()) {
			if (metric.value.equals(value)) {
				return metric;
			}
		}
		return null;
	}
}
