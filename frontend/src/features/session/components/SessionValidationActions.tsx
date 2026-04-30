import { Alert, Button, Stack } from '@mui/material';

type SessionValidationActionsProps = {
  canValidate: boolean;
  isSaving: boolean;
  error: string | null;
  onClearError: () => void;
  onValidate: () => void;
};

export const SessionValidationActions = ({
  canValidate,
  isSaving,
  error,
  onClearError,
  onValidate,
}: SessionValidationActionsProps) => (
  <Stack spacing={2} sx={{ pt: 1 }}>
    {error ? (
      <Alert severity="error" onClose={onClearError}>
        {error}
      </Alert>
    ) : null}
    <Button
      variant="contained"
      color="primary"
      disabled={!canValidate}
      onClick={onValidate}
    >
      {isSaving ? 'Enregistrement…' : 'Valider la session'}
    </Button>
  </Stack>
);
