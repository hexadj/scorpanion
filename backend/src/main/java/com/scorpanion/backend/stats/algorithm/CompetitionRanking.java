package com.scorpanion.backend.stats.algorithm;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

public final class CompetitionRanking {

	private CompetitionRanking() {
	}

	/**
	 * Computes competition ranks (1, 1, 3, ...) for a pre-sorted list.
	 * Rows with a null value from the extractor receive a null rank.
	 * Rows must already be in the desired order (best value first).
	 */
	public static <T> List<Integer> rank(List<T> sortedRows, Function<T, Long> valueExtractor) {
		List<Integer> ranks = new ArrayList<>(sortedRows.size());
		int position = 0;
		int currentRank = 1;
		Long prevValue = null;

		for (T row : sortedRows) {
			Long value = valueExtractor.apply(row);
			if (value == null) {
				ranks.add(null);
				continue;
			}
			position++;
			if (prevValue == null || !prevValue.equals(value)) {
				currentRank = position;
			}
			ranks.add(currentRank);
			prevValue = value;
		}

		return ranks;
	}
}


