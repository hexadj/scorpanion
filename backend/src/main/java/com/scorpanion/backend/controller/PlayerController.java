package com.scorpanion.backend.controller;

import com.scorpanion.backend.dto.CreatePlayerRequest;
import com.scorpanion.backend.dto.PlayerResponse;
import com.scorpanion.backend.entity.PlayerEntity;
import com.scorpanion.backend.mapper.PlayerMapper;
import com.scorpanion.backend.service.PlayerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/players")
public class PlayerController {

	private final PlayerService playerService;
	private final PlayerMapper playerMapper;

	public PlayerController(PlayerService playerService, PlayerMapper playerMapper) {
		this.playerService = playerService;
		this.playerMapper = playerMapper;
	}

	@GetMapping
	public List<PlayerResponse> listPlayers() {
		return playerMapper.toResponseList(playerService.listAll());
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public PlayerResponse createPlayer(@Valid @RequestBody CreatePlayerRequest request) {
		PlayerEntity player = playerService.create(request.name());
		return playerMapper.toResponse(player);
	}
}
