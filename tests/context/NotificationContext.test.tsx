import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { NotificationProvider, useNotifications } from '../../src/context/NotificationContext';

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({ on: vi.fn(), close: vi.fn() })),
}));

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { fullname: 'Test User', role: 'OrgHead' } }),
}));

vi.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue(undefined) })),
  useAppSelector: (selector: any) => selector({ notifications: { notifications: [{ _id: '1', title: 'Hello', message: 'World', read: false, createdAt: new Date().toISOString() }] } }),
}));

import Cookies from 'js-cookie';

const Consumer = () => {
  const { unreadCount } = useNotifications();
  return <div>{unreadCount}</div>;
};

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.mocked(Cookies.get).mockReturnValue('token');
  });

  it('exposes unread notification count', () => {
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
