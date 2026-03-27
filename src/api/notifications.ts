import api from "./api";

export interface Notification {
  _id: string;
  user: string;
  type: 'COMPLAINT_ASSIGNED' | 'STATUS_UPDATED' | ' COMMENT_ADDED' ;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notificationApi = {
  // Get current user's notifications
  getNotifications: () => 
    api.get<Notification[]>("/notifications"),

  // Mark a single notification as read
  markAsRead: (id: string) => 
    api.put<Notification>(`/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: () => 
    api.put<{ message: string }>("/notifications/read-all"),
};