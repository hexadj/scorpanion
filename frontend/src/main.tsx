/**
 * Point d'entrée de l'application frontend
 *
 * Monte l'arbre React dans #root avec le store Redux et le routeur (data router).
 * Le store est fourni via Provider pour que tous les composants puissent accéder
 * à l'état (auth, game) via useAppSelector / useAppDispatch.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AppRouter } from '@/router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </StrictMode>
);
