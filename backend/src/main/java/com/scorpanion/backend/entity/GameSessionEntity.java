package com.scorpanion.backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "game_session")
public class GameSessionEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "game_id", nullable = false, updatable = false)
	private GameEntity game;

	@Column(name = "played_at", nullable = false, updatable = false)
	private Instant playedAt;

	@OneToMany(mappedBy = "gameSession", cascade = CascadeType.ALL, orphanRemoval = true)
	private final List<SessionPlayerResultEntity> playerResults = new ArrayList<>();

	protected GameSessionEntity() {
	}

	public GameSessionEntity(GameEntity game, Instant playedAt) {
		this.game = game;
		this.playedAt = playedAt;
	}

	public UUID getId() {
		return id;
	}

	public GameEntity getGame() {
		return game;
	}

	public Instant getPlayedAt() {
		return playedAt;
	}

	public List<SessionPlayerResultEntity> getPlayerResults() {
		return List.copyOf(playerResults);
	}

	public void addPlayerResult(SessionPlayerResultEntity playerResult) {
		playerResult.attachToSession(this);
		this.playerResults.add(playerResult);
	}
}
