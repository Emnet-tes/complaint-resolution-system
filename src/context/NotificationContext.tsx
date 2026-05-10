import React, { createContext, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import type { Notification } from '../api/notifications';
import { useAuth } from './AuthContext';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchNotificationsThunk,
  markAllNotificationsReadThunk,
  markNotificationReadThunk,
  prependNotification,
  selectNotifications,
} from '../store/slices/notificationSlice';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector(selectNotifications);
  const token = Cookies.get('token');

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0;

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      await dispatch(fetchNotificationsThunk()).unwrap();
    } catch (_err) {
      console.error('Error fetching notifications');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await dispatch(markNotificationReadThunk({ id })).unwrap();
    } catch (_err) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsReadThunk()).unwrap();
      toast.success('All caught up!');
    } catch (_err) {
      toast.error('Failed to mark all as read');
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchNotifications();

      // Initialize WebSocket
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('new-notification', (notification: Notification) => {
        dispatch(prependNotification(notification));
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