import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { WS_BASE_URL } from '../config';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!token && !adminToken) return;
    if (isConnectedRef.current) return;

    const newSocket = io(WS_BASE_URL, {
      auth: { token, adminToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      isConnectedRef.current = true;
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
      isConnectedRef.current = false;
    });

    newSocket.on('connect_error', () => {
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

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      isConnectedRef.current = false;
    };
  }, []);

  const clearNotifications = () => setNotifications([]);
  const removeNotification = (index) => setNotifications(prev => prev.filter((_, i) => i !== index));

  return (
    <SocketContext.Provider value={{ socket, connected, notifications, clearNotifications, removeNotification }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
}

export default SocketContext;
