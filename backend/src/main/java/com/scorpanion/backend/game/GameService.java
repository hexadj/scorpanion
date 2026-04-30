package com.scorpanion.backend.game;

import com.scorpanion.backend.model.ResultType;

import java.util.List;

public interface GameService {

	GameEntity create(String name, ResultType resultType);

	List<GameEntity> listAll();
}


