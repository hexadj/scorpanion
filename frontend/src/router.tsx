import { RootLayout } from '@/layouts';
import { GameCreationPage, HomePage, LoginPage, RegisterPage, GamePage } from '@/pages';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        Component: RootLayout,
        children: [
            { index: true, Component: HomePage },
            { path: 'login', Component: LoginPage },
            { path: 'register', Component: RegisterPage },
            {
                path: 'game/:id',
                children: [
                    { path: 'create', Component: GameCreationPage },
                    { path: 'play/:gameId', Component: GamePage },
                ],
            },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}
