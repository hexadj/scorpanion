import { Alert } from '@mui/material';
import type { AxiosBaseQueryError } from '../../services';

type ApiError = { data?: { subCode?: string; message?: string } };

const resolveMessage = (error: AxiosBaseQueryError): string => {
  const apiError = error as ApiError;
  const subCode = apiError.data?.subCode;

  const messages: Record<string, string> = {
    MISSING_REQUIRED_FILTER: 'Un filtre requis est manquant pour cette combinaison.',
    UNSUPPORTED_METRIC_SCOPE_COMBINATION: 'Cette métrique n\'est pas disponible pour ce scope.',
    NO_SCORE_UNSUPPORTED: 'Cette métrique n\'est pas disponible pour les jeux sans score.',
    INVALID_TIME_RANGE: 'La plage temporelle est invalide.',
    TIME_RANGE_TOO_LARGE: 'La plage temporelle est trop large pour cet intervalle.',
    RESOURCE_NOT_FOUND: 'La ressource demandée est introuvable.',
  };

  return (subCode && messages[subCode]) ?? apiError.data?.message ?? 'Une erreur est survenue.';
};

type StatsErrorStateProps = {
  error: AxiosBaseQueryError;
};

export const StatsErrorState = ({ error }: StatsErrorStateProps) => (
  <Alert severity="error" sx={{ mt: 1 }}>
    {resolveMessage(error)}
  </Alert>
);
