import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const API = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : '/api',
});

API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('token');
  const adminData = localStorage.getItem('admin');
  const userData = localStorage.getItem('user');
  
  let token = null;
  
  if (adminData) {
    token = adminToken;
  } else if (userData) {
    token = userToken;
  } else if (adminToken) {
    token = adminToken;
  } else if (userToken) {
    token = userToken;
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
