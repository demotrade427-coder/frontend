import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, admin } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!token && !adminToken) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      auth: {
        token,
        adminToken,
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('new_deposit', (data) => {
      setNotifications(prev => [{ type: 'deposit', data, timestamp: Date.now() }, ...prev.slice(0, 9)]);
    });

    newSocket.on('new_withdrawal', (data) => {
      setNotifications(prev => [{ type: 'withdrawal', data, timestamp: Date.now() }, ...prev.slice(0, 9)]);
    });

    newSocket.on('new_trade', (data) => {
      setNotifications(prev => [{ type: 'trade', data, timestamp: Date.now() }, ...prev.slice(0, 9)]);
    });

    newSocket.on('new_user', (data) => {
      setNotifications(prev => [{ type: 'user', data, timestamp: Date.now() }, ...prev.slice(0, 9)]);
    });

    newSocket.on('new_ticket', (data) => {
      setNotifications(prev => [{ type: 'ticket', data, timestamp: Date.now() }, ...prev.slice(0, 9)]);
    });

    newSocket.on('loan_update', (data) => {
      setNotifications(prev => [{ type: 'loan', data, timestamp: Date.now() }, ...prev.slice(0, 9)]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, admin]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  const value = {
    socket,
    connected,
    notifications,
    clearNotifications,
    removeNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
