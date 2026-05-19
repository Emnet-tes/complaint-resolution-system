import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../helpers/testUtils';
import Login from '../../src/auth/Login';

// ── Mock context dependencies ────────────────────────────────────────────────
const mockLogin = vi.fn();
const mockLogout = vi.fn();

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: mockLogout,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../src/components/ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle" />
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('Login component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  const renderLogin = () => renderWithProviders(<Login />);

  it('renders login form correctly', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: abc@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('.........')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    const passwordInput = screen.getByPlaceholderText('.........');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // There is an eye icon button inside the password input wrapper
    // We can find it by its generic button role since it's the only other button besides submit and language/theme
    const toggleBtns = screen.getAllByRole('button');
    // The password toggle is right after the input
    const toggleBtn = passwordInput.parentElement!.querySelector('button')!;
    
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('calls login on form submit and navigates to the right dashboard', async () => {
    mockLogin.mockResolvedValueOnce({ role: 'SysAdmin' });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('Ex: abc@example.com'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('.........'), 'password123');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    expect(mockLogin).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'password123' });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message if login fails', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('Ex: abc@example.com'), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText('.........'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('navigates to org-head dashboard for OrgHead role', async () => {
    mockLogin.mockResolvedValueOnce({ role: 'OrgHead' });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('Ex: abc@example.com'), 'org@example.com');
    await user.type(screen.getByPlaceholderText('.........'), 'pass');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/org-head/dashboard');
    });
  });

  it('logs out and redirects to /login if role is unauthorized', async () => {
    // Unrecognized role
    mockLogin.mockResolvedValueOnce({ role: 'UnknownRole' });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('Ex: abc@example.com'), 'user@example.com');
    await user.type(screen.getByPlaceholderText('.........'), 'pass');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });
});
