package com.scorpanion.backend.stats.algorithm;

import java.util.ArrayList;
import java.util.List;

public final class HamiltonAlgorithm {

	private HamiltonAlgorithm() {
	}

	/**
	 * Allocates 100 percentage points across rawShares using the Hamilton (largest remainder) method.
	 * Preserves input order; the last element is treated as "others" and is deprioritized in tie-breaks.
	 * Returns an empty list if rawShares is empty.
	 */
	public static List<Integer> allocate(List<Double> rawShares) {
		if (rawShares.isEmpty()) {
			return List.of();
		}

		int n = rawShares.size();
		int[] floors = new int[n];
		double[] remainders = new double[n];
		int distributed = 0;

		for (int i = 0; i < n; i++) {
			floors[i] = (int) Math.floor(rawShares.get(i));
			remainders[i] = rawShares.get(i) - floors[i];
			distributed += floors[i];
		}

		int remaining = 100 - distributed;

		// Build index order sorted by remainder descending; tie-break: index ascending (others = last index → deprioritized)
		List<Integer> indices = new ArrayList<>();
		for (int i = 0; i < n; i++) {
			indices.add(i);
		}
		indices.sort((a, b) -> {
			int cmp = Double.compare(remainders[b], remainders[a]);
			if (cmp != 0) {
				return cmp;
			}
			return Integer.compare(a, b);
		});

		Integer[] result = new Integer[n];
		for (int i = 0; i < n; i++) {
			result[i] = floors[i];
		}
		for (int i = 0; i < remaining && i < n; i++) {
			result[indices.get(i)] += 1;
		}

		return List.of(result);
	}
}


