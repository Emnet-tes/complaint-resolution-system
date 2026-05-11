import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { renderWithProviders } from '../helpers/testUtils';

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('../../src/api/api', () => ({
  authApi: {
    getProfile: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

import Cookies from 'js-cookie';
import { authApi } from '../../src/api/api';

const Consumer = () => {
  const { user, loading } = useAuth();
  return <div>{loading ? 'loading' : user?.fullname || 'anon'}</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.mocked(Cookies.get).mockImplementation((key: string) => {
      if (key === 'accessToken') return 'token';
      if (key === 'refreshToken') return 'refresh';
      if (key === 'user') return JSON.stringify({ fullname: 'Cookie User', role: 'OrgHead' });
      return undefined;
    });
    vi.mocked(authApi.getProfile).mockResolvedValue({ data: { user: { fullName: 'Updated User', email: 'u@example.com', role: 'OrgHead' } } } as any);
  });

  it('hydrates and refreshes the user profile', async () => {
    renderWithProviders(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Updated User')).toBeInTheDocument();
    });
  });
});
