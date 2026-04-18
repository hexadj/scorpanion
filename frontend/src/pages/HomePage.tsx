import { Box, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const HomePage = () => {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 320 }}>
        <Button component={RouterLink} to="/sessions/new" variant="contained" size="large" fullWidth>
          Enregistrer une partie
        </Button>
        <Button component={RouterLink} to="/stats" variant="outlined" size="large" fullWidth>
          Statistiques
        </Button>
      </Stack>
    </Box>
  );
};
