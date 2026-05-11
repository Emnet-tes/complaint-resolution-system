import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/testUtils';

import ForgotPassword from '../../src/auth/ForgotPassword';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }) }));
vi.mock('../../src/components/ThemeToggle', () => ({ default: () => <div data-testid="theme-toggle" /> }));

describe('ForgotPassword (smoke)', () => {
  it('renders header', () => {
    renderWithProviders(<ForgotPassword />);
    expect(screen.getByText('auth.forgot_password_title')).toBeInTheDocument();
  });
});
