package com.scorpanion.backend.game;

import com.scorpanion.backend.shared.exception.DuplicateNameException;
import com.scorpanion.backend.model.ResultType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameServiceImplTest {

	@Mock
	private GameRepository gameRepository;

	@InjectMocks
	private GameServiceImpl gameService;

	@Test
	void createTrimsNameBeforeSaving() {
		when(gameRepository.existsByNameIgnoreCase("Azul")).thenReturn(false);
		when(gameRepository.save(any(GameEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		GameEntity created = gameService.create("  Azul  ", ResultType.HIGHEST_SCORE);

		ArgumentCaptor<GameEntity> savedGameCaptor = ArgumentCaptor.forClass(GameEntity.class);
		verify(gameRepository).existsByNameIgnoreCase("Azul");
		verify(gameRepository).save(savedGameCaptor.capture());
		assertThat(savedGameCaptor.getValue().getName()).isEqualTo("Azul");
		assertThat(created.getName()).isEqualTo("Azul");
		assertThat(created.getResultType()).isEqualTo(ResultType.HIGHEST_SCORE);
	}

	@Test
	void createThrowsConflictWhenNameAlreadyExistsIgnoringCase() {
		when(gameRepository.existsByNameIgnoreCase("azul")).thenReturn(true);

		assertThatThrownBy(() -> gameService.create("azul", ResultType.HIGHEST_SCORE))
			.isInstanceOf(DuplicateNameException.class)
			.hasMessageContaining("Game name already exists");

		verify(gameRepository).existsByNameIgnoreCase("azul");
		verify(gameRepository, never()).save(any(GameEntity.class));
	}
}


