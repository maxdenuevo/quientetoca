import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import GroupDashboard from './pages/GroupDashboard';
import ParticipantView from './pages/ParticipantView';
import NotFound from './pages/NotFound';

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
        path: '/create',
        element: <CreateGroup />,
      },
      {
        path: '/group/:groupId/:adminToken',
        element: <GroupDashboard />,
      },
      {
        path: '/participant/:participantId',
        element: <ParticipantView />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);