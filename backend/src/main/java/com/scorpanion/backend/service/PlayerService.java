package com.scorpanion.backend.service;

import com.scorpanion.backend.entity.PlayerEntity;

import java.util.List;

public interface PlayerService {

	PlayerEntity create(String name);

	List<PlayerEntity> listAll();
}
