import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { notificationApi } from '../api/notifications';
import type { Notification } from '../api/notifications';
import { useAuth } from './AuthContext';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const token = Cookies.get('token');

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await notificationApi.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) { toast.error("Failed to mark as read"); }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All caught up!");
    } catch (err) { toast.error("Failed to mark all as read"); }
  };

  useEffect(() => {
    if (token && user) {
      fetchNotifications();

      // Initialize WebSocket
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('new-notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast(notification.title, { icon: '🔔', position: 'bottom-right' });
      });

      return () => { newSocket.close(); };
    }
  }, [token, user]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};