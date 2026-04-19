import { Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PageContainer } from '../components';

export const HomePage = () => (
  <PageContainer centered maxWidth={320}>
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 320 }}>
      <Button component={RouterLink} to="/sessions/new" variant="contained" size="large" fullWidth>
        Enregistrer une partie
      </Button>
      <Button component={RouterLink} to="/stats" variant="outlined" size="large" fullWidth>
        Statistiques
      </Button>
    </Stack>
  </PageContainer>
);
