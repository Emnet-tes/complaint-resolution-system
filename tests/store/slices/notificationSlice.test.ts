import { describe, it, expect } from 'vitest';
import notificationReducer, {
  prependNotification,
  fetchNotificationsThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
  selectNotifications,
} from '../../../src/store/slices/notificationSlice';
import { createTestStore } from '../../helpers/testUtils';
import type { Notification } from '../../../src/api/notifications';

// ─── Fixtures ────────────────────────────────────────────────────────────────
const n1: Notification = {
  _id: 'n1',
  user: 'u1',
  type: 'STATUS_UPDATED',
  title: 'First',
  message: 'First notification',
  read: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};
const n2: Notification = {
  _id: 'n2',
  user: 'u1',
  type: 'STATUS_UPDATED',
  title: 'Second',
  message: 'Second notification',
  read: false,
  createdAt: '2024-01-02',
  updatedAt: '2024-01-02',
};

const initialState = { notifications: [], loading: false, submitting: false, error: null };

// ─── Reducer ─────────────────────────────────────────────────────────────────
describe('notificationSlice reducer', () => {
  it('returns the initial state', () => {
    expect(notificationReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('prependNotification', () => {
    it('adds the notification to the front of the list', () => {
      const state = notificationReducer(
        { ...initialState, notifications: [n2] },
        prependNotification(n1),
      );
      expect(state.notifications[0]._id).toBe('n1');
      expect(state.notifications).toHaveLength(2);
    });

    it('preserves existing notifications after the new one', () => {
      const state = notificationReducer(
        { ...initialState, notifications: [n2] },
        prependNotification(n1),
      );
      expect(state.notifications[1]._id).toBe('n2');
    });
  });
});

// ─── Selector ────────────────────────────────────────────────────────────────
describe('selectNotifications selector', () => {
  it('returns the notifications slice', () => {
    const store = createTestStore({
      notifications: { notifications: [n1, n2], loading: false, submitting: false, error: null },
    });
    const result = selectNotifications(store.getState());
    expect(result.notifications).toHaveLength(2);
    expect(result.notifications[0]._id).toBe('n1');
  });
});

// ─── Async thunks (via MSW) ────────────────────────────────────────────────
describe('notificationSlice async thunks', () => {
  describe('fetchNotificationsThunk', () => {
    it('sets loading=true while pending', async () => {
      const store = createTestStore();
      const promise = store.dispatch(fetchNotificationsThunk());
      expect(store.getState().notifications.loading).toBe(true);
      await promise;
    });

    it('populates notifications array on fulfilled', async () => {
      const store = createTestStore();
      await store.dispatch(fetchNotificationsThunk());
      expect(store.getState().notifications.notifications.length).toBeGreaterThan(0);
      expect(store.getState().notifications.loading).toBe(false);
    });

    it('sets loading=false and error on rejection', async () => {
      // Override the MSW handler to return a 500
      const { server } = await import('../../mocks/server');
      const { http, HttpResponse } = await import('msw');
      server.use(
        http.get(`${import.meta.env.VITE_API_URL}/notifications`, () =>
          HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
        ),
      );

      const store = createTestStore();
      await store.dispatch(fetchNotificationsThunk());
      expect(store.getState().notifications.loading).toBe(false);
      expect(store.getState().notifications.error).toBeTruthy();
    });
  });

  describe('markNotificationReadThunk', () => {
    it('marks the correct notification as read', async () => {
      const store = createTestStore({
        notifications: { notifications: [n1, n2], loading: false, submitting: false, error: null },
      });
      await store.dispatch(markNotificationReadThunk({ id: 'n1' }));
      const updated = store.getState().notifications.notifications.find((n) => n._id === 'n1');
      expect(updated?.read).toBe(true);
    });

    it('leaves other notifications unchanged', async () => {
      const store = createTestStore({
        notifications: { notifications: [n1, n2], loading: false, submitting: false, error: null },
      });
      await store.dispatch(markNotificationReadThunk({ id: 'n1' }));
      const other = store.getState().notifications.notifications.find((n) => n._id === 'n2');
      expect(other?.read).toBe(false);
    });
  });

  describe('markAllNotificationsReadThunk', () => {
    it('marks every notification as read', async () => {
      const store = createTestStore({
        notifications: { notifications: [n1, n2], loading: false, submitting: false, error: null },
      });
      await store.dispatch(markAllNotificationsReadThunk());
      const all = store.getState().notifications.notifications;
      expect(all.every((n) => n.read)).toBe(true);
    });
  });
});
