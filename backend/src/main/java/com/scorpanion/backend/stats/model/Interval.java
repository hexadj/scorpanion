package com.scorpanion.backend.stats.model;

public enum Interval {

	HOUR("hour"),
	DAY("day"),
	WEEK("week"),
	MONTH("month");

	private final String value;

	Interval(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static Interval fromValue(String value) {
		for (Interval interval : values()) {
			if (interval.value.equals(value)) {
				return interval;
			}
		}
		return null;
	}
}


