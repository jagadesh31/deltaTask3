import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { authContext } from '../../contexts/authContext.jsx';
import { Home as ClientHome } from '../client/home.jsx';
import { AdminHome } from '../admin/home.jsx';
import { DistributorHome } from '../distributor/home.jsx';
// import { ExhibitorHome } from '../exhibitor/home.jsx';

export function UnifiedHome() {
  const { user } = useContext(authContext);

  if (!user || !user.role || user.role === 'client' || user.role === 'CLIENT') {
    return <ClientHome />;
  } else if (user.role === 'admin' || user.role === 'ADMIN') {
    return <AdminHome />;
  } else if (user.role === 'distributor' || user.role === 'DISTRIBUTOR') {
    return <DistributorHome />;
  } else if (user.role === 'exhibitor' || user.role === 'EXHIBITOR') {
    return <ClientHome />;
  }

  // fallback
  return <ClientHome />;
}
