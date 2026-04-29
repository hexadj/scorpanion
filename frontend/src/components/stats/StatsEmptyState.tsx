import { Box, Typography } from '@mui/material';

type StatsEmptyStateProps = {
  message?: string;
};

export const StatsEmptyState = ({ message = 'Aucune donnée disponible.' }: StatsEmptyStateProps) => (
  <Box
    sx={{
      py: 4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);
