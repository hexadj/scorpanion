import { Stack } from '@mui/material';
import {
  CreateGameModal,
  PageContainer,
  SessionGameSelect,
  SessionPlayerListEditor,
  SessionValidationActions,
} from '../components';
import { useCreateGameModal, useSessionForm, useSubmitSession } from '../hooks';
import { type AxiosBaseQueryError } from '../services';

export const NewSessionPage = () => {
  const {
    form,
    fields,
    addPlayer,
    excludePlayerIds,
    games,
    gamesLoading,
    gamesError,
    gamesQueryError,
    selectedGameId,
    resultEntryMode,
  } = useSessionForm();

  const gameModal = useCreateGameModal((gameId) => form.setValue('gameId', gameId));

  const session = useSubmitSession(form, resultEntryMode);

  const gamesErrorMessage =
    gamesQueryError && typeof gamesQueryError === 'object' && 'data' in gamesQueryError
      ? String((gamesQueryError as AxiosBaseQueryError).data)
      : 'Impossible de charger les jeux.';

  const canValidate =
    Boolean(selectedGameId) &&
    fields.length > 0 &&
    resultEntryMode !== 'none' &&
    !session.isSaving;

  return (
    <PageContainer title="Nouvelle session">
      <Stack spacing={3} sx={{ mt: 2 }}>
        <SessionGameSelect
          games={games}
          isLoading={gamesLoading}
          isError={gamesError}
          errorMessage={gamesErrorMessage}
          selectedGameId={selectedGameId}
          onSelectChange={(e) => form.setValue('gameId', e.target.value)}
          onOpenCreateModal={gameModal.openModal}
        />

        <SessionPlayerListEditor
          fields={fields}
          control={form.control}
          resultEntryMode={resultEntryMode}
          onAddPlayer={addPlayer}
          excludePlayerIds={excludePlayerIds}
        />

        {resultEntryMode !== 'none' ? (
          <SessionValidationActions
            canValidate={canValidate}
            isSaving={session.isSaving}
            error={session.error}
            onClearError={session.clearError}
            onValidate={() => void session.submit()}
          />
        ) : null}
      </Stack>

      <CreateGameModal
        open={gameModal.open}
        onClose={gameModal.closeModal}
        onSubmit={gameModal.handleSubmit}
        isSubmitting={gameModal.isCreating}
        submitError={gameModal.error}
      />
    </PageContainer>
  );
};
