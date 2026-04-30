package com.scorpanion.backend.session;

import com.scorpanion.backend.player.PlayerEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.UUID;

@Entity
@Table(
	name = "session_player_result",
	uniqueConstraints = @UniqueConstraint(
		name = "uk_session_player_result_session_player",
		columnNames = {"game_session_id", "player_id"}
	)
)
public class SessionPlayerResultEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "game_session_id", nullable = false, updatable = false)
	private GameSessionEntity gameSession;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "player_id", nullable = false, updatable = false)
	private PlayerEntity player;

	private Integer score;

	private Integer rank;

	@Column(name = "is_winner", nullable = false, updatable = false)
	private boolean winner;

	protected SessionPlayerResultEntity() {
	}

	public SessionPlayerResultEntity(PlayerEntity player, Integer score, Integer rank, boolean winner) {
		this.player = player;
		this.score = score;
		this.rank = rank;
		this.winner = winner;
	}

	void attachToSession(GameSessionEntity gameSession) {
		this.gameSession = gameSession;
	}

	public UUID getId() {
		return id;
	}

	public GameSessionEntity getGameSession() {
		return gameSession;
	}

	public PlayerEntity getPlayer() {
		return player;
	}

	public Integer getScore() {
		return score;
	}

	public Integer getRank() {
		return rank;
	}

	public boolean isWinner() {
		return winner;
	}
}


