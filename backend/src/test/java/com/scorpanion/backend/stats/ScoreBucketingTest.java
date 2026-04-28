package com.scorpanion.backend.stats;

import java.util.List;

import com.scorpanion.backend.stats.service.internal.ScoreBucketing;
import com.scorpanion.backend.stats.service.internal.ScoreBucketing.ScoreBucket;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ScoreBucketingTest {

	@Test
	void minEqualsMax_returnsSingleBucket() {
		List<ScoreBucket> buckets = ScoreBucketing.compute(5, 5);
		assertThat(buckets).hasSize(1);
		assertThat(buckets.get(0).lowerInclusive()).isEqualTo(5);
	}

	@Test
	void bucketsHaveNoGaps() {
		List<ScoreBucket> buckets = ScoreBucketing.compute(0, 100);
		for (int i = 1; i < buckets.size(); i++) {
			assertThat(buckets.get(i).lowerInclusive())
				.isEqualTo(buckets.get(i - 1).upperExclusive());
		}
	}

	@Test
	void allBucketsContainRange() {
		List<ScoreBucket> buckets = ScoreBucketing.compute(0, 50);
		assertThat(buckets.get(0).lowerInclusive()).isLessThanOrEqualTo(0);
		assertThat(buckets.get(buckets.size() - 1).upperExclusive()).isGreaterThan(50);
	}
}
