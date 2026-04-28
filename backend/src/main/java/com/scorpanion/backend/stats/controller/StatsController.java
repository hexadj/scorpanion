package com.scorpanion.backend.stats.controller;

import java.time.Instant;
import java.util.UUID;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.scorpanion.backend.stats.dto.CatalogResponse;
import com.scorpanion.backend.stats.dto.DistributionGamesResponse;
import com.scorpanion.backend.stats.dto.DistributionParticipationsResponse;
import com.scorpanion.backend.stats.dto.DistributionScoresResponse;
import com.scorpanion.backend.stats.dto.DistributionWinsResponse;
import com.scorpanion.backend.stats.dto.RankingsPlayersResponse;
import com.scorpanion.backend.stats.dto.TimeseriesResponse;
import com.scorpanion.backend.stats.service.StatsService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@Validated
@RequestMapping("/stats")
public class StatsController {

	private final StatsService statsService;

	public StatsController(StatsService statsService) {
		this.statsService = statsService;
	}

	@GetMapping("/catalog")
	public CatalogResponse getCatalog() {
		return statsService.getCatalog();
	}

	@GetMapping("/timeseries")
	public TimeseriesResponse getTimeseries(
		@RequestParam String metric,
		@RequestParam String scope,
		@RequestParam String interval,
		@RequestParam(required = false) Instant from,
		@RequestParam(required = false) Instant to,
		@RequestParam(required = false) UUID playerId,
		@RequestParam(required = false) UUID gameId
	) {
		return statsService.getTimeseries(metric, scope, interval, from, to, playerId, gameId);
	}

	@GetMapping("/rankings/players")
	public RankingsPlayersResponse getRankingsPlayers(
		@RequestParam String metric,
		@RequestParam(required = false) Instant from,
		@RequestParam(required = false) Instant to,
		@RequestParam(required = false) UUID gameId,
		@RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit,
		@RequestParam(defaultValue = "0") @Min(0) int offset
	) {
		return statsService.getRankingsPlayers(metric, from, to, gameId, limit, offset);
	}

	@GetMapping("/distributions/games")
	public DistributionGamesResponse getDistributionGames(
		@RequestParam String scope,
		@RequestParam(required = false) UUID playerId,
		@RequestParam(required = false) Instant from,
		@RequestParam(required = false) Instant to,
		@RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit,
		@RequestParam(defaultValue = "true") boolean includeOthers
	) {
		return statsService.getDistributionGames(scope, playerId, from, to, limit, includeOthers);
	}

	@GetMapping("/distributions/scores")
	public DistributionScoresResponse getDistributionScores(
		@RequestParam String scope,
		@RequestParam(required = false) UUID playerId,
		@RequestParam(required = false) UUID gameId,
		@RequestParam(required = false) Instant from,
		@RequestParam(required = false) Instant to,
		@RequestParam(defaultValue = "30") @Min(1) @Max(100) int limit,
		@RequestParam(defaultValue = "true") boolean includeOthers
	) {
		return statsService.getDistributionScores(scope, playerId, gameId, from, to, limit, includeOthers);
	}

	@GetMapping("/distributions/wins")
	public DistributionWinsResponse getDistributionWins(
		@RequestParam String scope,
		@RequestParam(required = false) UUID gameId,
		@RequestParam(required = false) Instant from,
		@RequestParam(required = false) Instant to
	) {
		return statsService.getDistributionWins(scope, gameId, from, to);
	}

	@GetMapping("/distributions/participations")
	public DistributionParticipationsResponse getDistributionParticipations(
		@RequestParam String scope,
		@RequestParam(required = false) UUID gameId,
		@RequestParam(required = false) Instant from,
		@RequestParam(required = false) Instant to
	) {
		return statsService.getDistributionParticipations(scope, gameId, from, to);
	}
}
