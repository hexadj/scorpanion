package com.scorpanion.backend.player;


import java.util.List;

public interface PlayerService {

	PlayerEntity create(String name);

	List<PlayerEntity> listAll();
}


