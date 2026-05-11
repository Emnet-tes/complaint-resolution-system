import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ResetPassword from '../../src/auth/ResetPassword';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }) }));
vi.mock('../../src/components/ThemeToggle', () => ({ default: () => <div data-testid="theme-toggle" /> }));
vi.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => vi.fn(() => ({ unwrap: vi.fn() })),
  useAppSelector: (selector: any) => selector({ auth: { submitting: false, error: null } }),
}));

describe('ResetPassword smoke', () => {
  it('renders the reset password title', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/reset-password', search: '?email=test@example.com', state: { email: 'test@example.com', otp: '123456' } }]}>
        <ResetPassword />
      </MemoryRouter>,
    );
    expect(screen.getByText('auth.reset_password_title')).toBeInTheDocument();
  });
});
