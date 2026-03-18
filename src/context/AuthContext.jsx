import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('user');
    const adminData = localStorage.getItem('admin');
    
    if (adminToken && adminData) {
      const admin = JSON.parse(adminData);
      setUser({ ...admin, isAdmin: true });
      axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
    } else if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/admin/login`, { email, password });
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser({ ...data.admin, isAdmin: true });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Admin login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/register`, userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const isAdmin = user?.isAdmin || user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, register, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};