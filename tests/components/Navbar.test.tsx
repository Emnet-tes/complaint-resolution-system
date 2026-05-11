import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Navbar from '../../src/components/Navbar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { fullname: 'Test User' }, loading: false, login: vi.fn(), logout: vi.fn(), refreshProfile: vi.fn() }),
}));

vi.mock('../../src/context/NotificationContext', () => ({
  useNotifications: () => ({ notifications: [], unreadCount: 0, fetchNotifications: vi.fn(), markAsRead: vi.fn(), markAllAsRead: vi.fn() }),
}));

vi.mock('../../src/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

describe('Navbar', () => {
  it('renders navigation element', () => {
    render(
      <MemoryRouter>
        <Navbar onMenuClick={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
