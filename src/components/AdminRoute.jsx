import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const adminToken = localStorage.getItem('adminToken');

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin || !adminToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AdminRoute;