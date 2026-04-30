package com.scorpanion.backend.stats.dto;

import java.util.List;

public record CatalogResponse(
	List<String> supportedIntervals,
	List<String> supportedScopes,
	List<MetricInfo> metrics
) {

	public record MetricInfo(
		String id,
		String label,
		String description,
		List<String> supportedDatasets,
		List<String> constraints
	) {
	}
}


