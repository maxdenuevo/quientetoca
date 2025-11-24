import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import AuthCallback from './pages/AuthCallback';
import JoinGroup from './pages/JoinGroup';
import OrganizerDashboard from './pages/OrganizerDashboard';
import NotFound from './pages/NotFound';
import DesignSystem from './pages/DesignSystem';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        // Legacy routes - redirect to home
        path: '/create',
        element: <Navigate to="/" replace />,
      },
      {
        path: '/mis-sorteos',
        element: <Navigate to="/" replace />,
      },
      {
        path: '/group/:groupId/:adminToken',
        element: <Navigate to="/" replace />,
      },
      {
        path: '/participant/:participantId',
        element: <Navigate to="/" replace />,
      },
      {
        path: '/auth/callback',
        element: <AuthCallback />,
      },
      {
        // Public join page
        path: '/join/:joinCode',
        element: <JoinGroup />,
      },
      {
        // Organizer dashboard
        path: '/organizer/:groupId',
        element: <OrganizerDashboard />,
      },
      {
        // Design System preview (dev only)
        path: '/design-system',
        element: <DesignSystem />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
