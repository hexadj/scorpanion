import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type PageContainerProps = {
  title?: string;
  maxWidth?: number;
  centered?: boolean;
  children: ReactNode;
};

export const PageContainer = ({
  title,
  maxWidth,
  centered = false,
  children,
}: PageContainerProps) => (
  <Box
    component="main"
    sx={
      centered
        ? {
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }
        : {
          p: 3,
          maxWidth: maxWidth ?? 520,
          width: '100%',
          mx: 'auto',
        }
    }
  >
    {title ? (
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
    ) : null}
    {children}
  </Box>
);
