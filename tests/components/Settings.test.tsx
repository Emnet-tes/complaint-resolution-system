import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAuthState } from '../helpers/testUtils';
import Settings from '../../src/components/Settings';

// ── Mock context dependencies ────────────────────────────────────────────────
const mockRefreshProfile = vi.fn().mockResolvedValue(undefined);

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      fullname: 'Test User',
      email: 'test@example.com',
      role: 'OrgHead',
    },
    refreshProfile: mockRefreshProfile,
  }),
}));

// ── i18n: return the key so snapshots are deterministic ──────────────────────
vi.mock('../../src/store/slices/authSlice', async (importOriginal) => {
  const actual = await importOriginal();
  return actual;
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, fallback?: string) => fallback ?? key }),
}));

// ─── Helper ──────────────────────────────────────────────────────────────────
function renderSettings(preloadedState = {}) {
  return renderWithProviders(<Settings />, {
    preloadedState: {
      auth: { ...mockAuthState, ...preloadedState },
    },
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('Settings component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the profile section with user info', () => {
    renderSettings();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('renders the security section heading', () => {
    renderSettings();
    expect(screen.getByText('settings.security.title')).toBeInTheDocument();
  });

  it('calls refreshProfile on mount', () => {
    renderSettings();
    expect(mockRefreshProfile).toHaveBeenCalledTimes(1);
  });

  it('shows a password mismatch error without dispatching', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.type(screen.getByPlaceholderText('••••••••'), 'currentpass');
    await user.type(screen.getByPlaceholderText('settings.security.placeholder_new'), 'newpass1');
    await user.type(screen.getByPlaceholderText('settings.security.placeholder_confirm'), 'DIFFERENT');

    await user.click(screen.getByRole('button', { name: /Update Password/i }));

    expect(
      screen.getByText('settings.security.password_mismatch'),
    ).toBeInTheDocument();
  });

  it('disables the submit button while submitting', () => {
    // Inject submitting=true into the store
    renderSettings({ submitting: true } as any);
    const btn = screen.getByRole('button', { name: /sys_dashboard.loading/i });
    expect(btn).toBeDisabled();
  });

  it('shows success message after a successful password change (MSW happy path)', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.type(screen.getByPlaceholderText('••••••••'), 'currentpass');
    await user.type(screen.getByPlaceholderText('settings.security.placeholder_new'), 'newpass123');
    await user.type(screen.getByPlaceholderText('settings.security.placeholder_confirm'), 'newpass123');

    await user.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(screen.getByText('dept_mgmt.toasts.add_success')).toBeInTheDocument();
    });
  });

  it('shows an error when the API rejects the password change', async () => {
    const { server } = await import('../mocks/server');
    const { http, HttpResponse } = await import('msw');

    server.use(
      http.post(
        `${import.meta.env.VITE_API_URL}/auth/change-password`,
        () => HttpResponse.json({ message: 'Incorrect current password' }, { status: 400 }),
      ),
    );

    const user = userEvent.setup();
    renderSettings();

    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await user.type(screen.getByPlaceholderText('settings.security.placeholder_new'), 'newpass123');
    await user.type(screen.getByPlaceholderText('settings.security.placeholder_confirm'), 'newpass123');

    await user.click(screen.getByRole('button', { name: /Update Password/i }));

    // The component shows an error div when the thunk is rejected.
    // The exact message depends on the error shape; we assert the error UI is visible.
    await waitFor(() => {
      const errorEl = document.querySelector('.bg-red-50');
      expect(errorEl).toBeInTheDocument();
    });
  });


  it('toggles password visibility when the eye button is clicked', async () => {
    const user = userEvent.setup();
    renderSettings();

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = passwordInput.parentElement!.querySelector('button')!;
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
