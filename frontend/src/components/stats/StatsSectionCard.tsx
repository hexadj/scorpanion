import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type StatsSectionCardProps = {
  title: string;
  controls?: ReactNode;
  isLoading?: boolean;
  children: ReactNode;
};

export const StatsSectionCard = ({ title, controls, isLoading = false, children }: StatsSectionCardProps) => (
  <Box
    sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      p: 2,
      mb: 3,
    }}
  >
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: { sm: 'space-between' } }}
      mb={1}
    >
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      {controls ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          {controls}
        </Stack>
      ) : null}
    </Stack>
    <Divider sx={{ mb: 2 }} />
    {isLoading ? (
      <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    ) : (
      children
    )}
  </Box>
);
