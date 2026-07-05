import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { authContext } from '../../contexts/authContext.jsx';
import { AdminDashboard } from '../admin/dashboard.jsx';
import { DistributorDashboard } from '../distributor/dashboard.jsx';
import { ExhibitorDashboard } from '../exhibitor/dashboard.jsx';
import { Unauthorized } from './unauthorized.jsx';

export function UnifiedDashboard() {
  const { user } = useContext(authContext);

  if (!user || !user.role || user.role === 'client' || user.role === 'CLIENT') {
    return <Unauthorized />;
  } else if (user.role === 'admin' || user.role === 'ADMIN') {
    return <AdminDashboard />;
  } else if (user.role === 'distributor' || user.role === 'DISTRIBUTOR') {
    return <DistributorDashboard />;
  } else if (user.role === 'exhibitor' || user.role === 'EXHIBITOR') {
    return <ExhibitorDashboard />;
  }

  return <Unauthorized />;
}
