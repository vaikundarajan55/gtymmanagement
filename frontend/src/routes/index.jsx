import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from './RootLayout';
import PageLoader from '../components/common/PageLoader';
import websiteRoutes from './websiteRoutes';
import adminRoutes from './adminRoutes';

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    HydrateFallback: PageLoader,
    children: [
      ...websiteRoutes,
      ...adminRoutes,
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
