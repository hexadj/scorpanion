package com.scorpanion.backend.stats;

import java.util.List;

import com.scorpanion.backend.stats.service.internal.HamiltonAlgorithm;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HamiltonAlgorithmTest {

	@Test
	void emptyInput_returnsEmptyList() {
		assertThat(HamiltonAlgorithm.allocate(List.of())).isEmpty();
	}

	@Test
	void singleBucket_gets100() {
		List<Integer> result = HamiltonAlgorithm.allocate(List.of(100.0));
		assertThat(result).containsExactly(100);
	}

	@Test
	void sumAlwaysEquals100() {
		List<Double> shares = List.of(33.33, 33.33, 33.34);
		int total = HamiltonAlgorithm.allocate(shares).stream().mapToInt(Integer::intValue).sum();
		assertThat(total).isEqualTo(100);
	}

	@Test
	void equalShares_distributedEvenly() {
		List<Integer> result = HamiltonAlgorithm.allocate(List.of(25.0, 25.0, 25.0, 25.0));
		assertThat(result).containsExactly(25, 25, 25, 25);
	}

	@Test
	void lastBucketDeprioritizedOnTie() {
		// Two equal remainders: first index (not last) should get the extra point
		List<Integer> result = HamiltonAlgorithm.allocate(List.of(50.0, 50.0));
		assertThat(result.stream().mapToInt(Integer::intValue).sum()).isEqualTo(100);
	}
}
