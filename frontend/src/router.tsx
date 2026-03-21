import { RootLayout } from '@/layouts';
import { HomePage, LoginPage, RegisterPage } from '@/pages';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        Component: RootLayout,
        children: [
            { index: true, Component: HomePage },
            { path: 'login', Component: LoginPage },
            { path: 'register', Component: RegisterPage },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}
