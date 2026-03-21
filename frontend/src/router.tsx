import { RootLayout } from '@/layouts';
import { HomePage } from '@/pages';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        Component: RootLayout,
        children: [
            { index: true, Component: HomePage },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}
