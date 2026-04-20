import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase =
    (env.VITE_API_BASE_URL || env.API_BASE_URL || '').trim().replace(
      /\/+$/,
      '',
    );

  return {
    plugins: [react()],
    define: {
      __SCORPANION_API_BASE_URL__: JSON.stringify(apiBase),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  };
});
