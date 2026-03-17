import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

function Layout() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-premium-dark">
      <Sidebar isAdmin={isAdmin} />
      <div className="lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
