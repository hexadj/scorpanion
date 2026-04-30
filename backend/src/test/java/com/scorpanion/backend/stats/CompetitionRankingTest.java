package com.scorpanion.backend.stats;

import java.util.List;

import com.scorpanion.backend.stats.algorithm.CompetitionRanking;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CompetitionRankingTest {

	@Test
	void noTies_sequentialRanks() {
		List<Integer> ranks = CompetitionRanking.rank(List.of(10L, 8L, 5L), v -> v);
		assertThat(ranks).containsExactly(1, 2, 3);
	}

	@Test
	void tiedValues_skipRank() {
		List<Integer> ranks = CompetitionRanking.rank(List.of(10L, 10L, 5L), v -> v);
		assertThat(ranks).containsExactly(1, 1, 3);
	}

	@Test
	void nullValues_receiveNullRank() {
		List<Long> input = new java.util.ArrayList<>();
		input.add(10L);
		input.add(null);
		input.add(5L);
		List<Integer> ranks = CompetitionRanking.rank(input, v -> v);
		assertThat(ranks.get(0)).isEqualTo(1);
		assertThat(ranks.get(1)).isNull();
		assertThat(ranks.get(2)).isEqualTo(2);
	}

	@Test
	void emptyList_returnsEmptyRanks() {
		assertThat(CompetitionRanking.rank(List.of(), v -> (Long) v)).isEmpty();
	}
}

