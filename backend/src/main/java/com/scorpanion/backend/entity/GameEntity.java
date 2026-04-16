package com.scorpanion.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import com.scorpanion.backend.model.ResultType;

import java.util.UUID;

@Entity
@Table(name = "game")
public class GameEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false, length = 120, updatable = false)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(name = "result_type", nullable = false, length = 32, updatable = false)
	private ResultType resultType;

	protected GameEntity() {
	}

	public GameEntity(String name, ResultType resultType) {
		this.name = name;
		this.resultType = resultType;
	}

	public UUID getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public ResultType getResultType() {
		return resultType;
	}
}
