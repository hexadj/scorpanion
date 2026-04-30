package com.scorpanion.backend.player;

import com.scorpanion.backend.shared.exception.DuplicateNameException;
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
class PlayerServiceImplTest {

	@Mock
	private PlayerRepository playerRepository;

	@InjectMocks
	private PlayerServiceImpl playerService;

	@Test
	void createTrimsNameBeforeSaving() {
		when(playerRepository.existsByNameIgnoreCase("Alice")).thenReturn(false);
		when(playerRepository.save(any(PlayerEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

		PlayerEntity created = playerService.create("  Alice  ");

		ArgumentCaptor<PlayerEntity> savedPlayerCaptor = ArgumentCaptor.forClass(PlayerEntity.class);
		verify(playerRepository).existsByNameIgnoreCase("Alice");
		verify(playerRepository).save(savedPlayerCaptor.capture());
		assertThat(savedPlayerCaptor.getValue().getName()).isEqualTo("Alice");
		assertThat(created.getName()).isEqualTo("Alice");
	}

	@Test
	void createThrowsConflictWhenNameAlreadyExistsIgnoringCase() {
		when(playerRepository.existsByNameIgnoreCase("alice")).thenReturn(true);

		assertThatThrownBy(() -> playerService.create("alice"))
			.isInstanceOf(DuplicateNameException.class)
			.hasMessageContaining("Player name already exists");

		verify(playerRepository).existsByNameIgnoreCase("alice");
		verify(playerRepository, never()).save(any(PlayerEntity.class));
	}
}


