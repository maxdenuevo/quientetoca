import { createBrowserRouter, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import AuthCallback from './pages/AuthCallback';
import GroupPage from './pages/GroupPage';
import NotFound from './pages/NotFound';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { apiClient } from './lib/api-client';

/**
 * Legacy redirect component for /organizer/:groupId
 * Looks up the join_code and redirects to /group/:joinCode
 */
function LegacyOrganizerRedirect() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    async function lookupAndRedirect() {
      try {
        const joinCode = await apiClient.getGroupJoinCode(groupId);
        if (joinCode) {
          navigate(`/group/${joinCode}`, { replace: true });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error looking up group:', err);
        setError(true);
      }
    }

    lookupAndRedirect();
  }, [groupId, navigate]);

  if (error) {
    return <Navigate to="/" replace />;
  }

  return <LoadingSpinner message="Redirigiendo..." />;
}

/**
 * Legacy redirect component for /join/:joinCode
 * Simply redirects to /group/:joinCode
 */
function LegacyJoinRedirect() {
  const { joinCode } = useParams();
  return <Navigate to={`/group/${joinCode}`} replace />;
}

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
        // NEW: Unified group page
        path: '/group/:joinCode',
        element: <GroupPage />,
      },
      {
        // Legacy: redirect /join/:joinCode to /group/:joinCode
        path: '/join/:joinCode',
        element: <LegacyJoinRedirect />,
      },
      {
        // Legacy: redirect /organizer/:groupId to /group/:joinCode
        path: '/organizer/:groupId',
        element: <LegacyOrganizerRedirect />,
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
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
