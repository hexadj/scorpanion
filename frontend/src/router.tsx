import { GameLayout, GuestAuthLayout, RootLayout } from '@/layouts';
import { GameCreationPage, GamePage, HistoryPage, HomePage, LoginPage, RegisterPage } from '@/pages';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter(
    [
        {
            path: '/',
            Component: RootLayout,
            children: [
                { index: true, Component: HomePage },
                {
                    path: 'login',
                    Component: GuestAuthLayout,
                    children: [{ index: true, Component: LoginPage }],
                },
                {
                    path: 'register',
                    Component: GuestAuthLayout,
                    children: [{ index: true, Component: RegisterPage }],
                },
                { path: 'history', Component: HistoryPage },
                {
                    path: 'game/:boardGameId',
                    children: [
                        { path: 'create', Component: GameCreationPage },
                        {
                            path: 'play/:gameId',
                            Component: GameLayout,
                            children: [{ index: true, Component: GamePage }],
                        },
                    ],
                },
            ],
        },
    ],
    { basename: import.meta.env.BASE_URL },
);

export function AppRouter() {
    return <RouterProvider router={router} />;
}
