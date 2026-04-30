package com.scorpanion.backend.stats.service.internal;

import java.util.ArrayList;
import java.util.List;

public final class ScoreBucketing {

	private static final int TARGET_BUCKET_COUNT = 10;
	private static final int[] NICE_STEPS = {1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000};

	private ScoreBucketing() {
	}

	public static List<ScoreBucket> compute(int min, int max) {
		if (min == max) {
			return List.of(new ScoreBucket(min, min + 1, String.valueOf(min)));
		}

		long range = (long) max - min;
		double rawStep = (double) range / TARGET_BUCKET_COUNT;
		int step = niceStep(rawStep);

		int start = (min / step) * step;
		if (start > min) {
			start -= step;
		}

		List<ScoreBucket> buckets = new ArrayList<>();
		int current = start;
		while (current <= max) {
			int lower = current;
			int upper = current + step;
			String label = lower + "-" + (upper - 1);
			buckets.add(new ScoreBucket(lower, upper, label));
			current = upper;
		}
		return buckets;
	}

	private static int niceStep(double rawStep) {
		for (int step : NICE_STEPS) {
			if (step >= rawStep) {
				return step;
			}
		}
		return (int) Math.pow(10, Math.ceil(Math.log10(rawStep)));
	}

	public record ScoreBucket(int lowerInclusive, int upperExclusive, String label) {
	}
}
