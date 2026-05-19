import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import LoginPage from '../../src/pages/Login';

const navigateMock = vi.fn();

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn().mockResolvedValue({ role: 'OrgAdmin' }) }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('Login page smoke', () => {
  it('renders and submits the login form', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const inputs = container.querySelectorAll('input');
    await user.type(inputs[0] as HTMLInputElement, 'test@example.com');
    await user.type(inputs[1] as HTMLInputElement, 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/org-dashboard'));
  });
});
