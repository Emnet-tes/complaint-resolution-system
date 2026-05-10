import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { notificationApi, type Notification } from '../../api/notifications';
import type { RootState } from '../index';

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  submitting: false,
  error: null,
};

const normalizeNotifications = (payload: unknown): Notification[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const value = payload as { notifications?: unknown; data?: unknown; items?: unknown };
    if (Array.isArray(value.notifications)) return value.notifications as Notification[];
    if (Array.isArray(value.data)) return value.data as Notification[];
    if (Array.isArray(value.items)) return value.items as Notification[];
  }
  return [];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'response' in error) {
    const maybeResponse = error as { response?: { data?: { message?: string } } };
    return maybeResponse.response?.data?.message || fallback;
  }
  return fallback;
};

export const fetchNotificationsThunk = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await notificationApi.getNotifications();
    return normalizeNotifications(res.data);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to fetch notifications'));
  }
});

export const markNotificationReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (payload: { id: string }, { rejectWithValue }) => {
    try {
      await notificationApi.markAsRead(payload.id);
      return payload.id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to mark notification as read'));
    }
  },
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationApi.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to mark all notifications as read'));
    }
  },
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    prependNotification: (state, action: { payload: Notification }) => {
      state.notifications = [action.payload, ...state.notifications];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch notifications';
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((notification) =>
          notification._id === action.payload ? { ...notification, read: true } : notification,
        );
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
        state.notifications = state.notifications.map((notification) => ({ ...notification, read: true }));
      });
  },
});

export const { prependNotification } = notificationSlice.actions;

export const selectNotifications = (state: RootState) => state.notifications;

export default notificationSlice.reducer;
