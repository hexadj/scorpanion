package com.scorpanion.backend.service;

import com.scorpanion.backend.entity.GameEntity;
import com.scorpanion.backend.model.ResultType;

import java.util.List;

public interface GameService {

	GameEntity create(String name, ResultType resultType);

	List<GameEntity> listAll();
}
