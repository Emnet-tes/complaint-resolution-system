import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';

// Mock heavy providers and pages so router can mount quickly
vi.mock('../../src/context/AuthContext', () => ({ AuthProvider: ({ children }: any) => children }));

vi.mock('../../src/context/NotificationContext', () => ({ NotificationProvider: ({ children }: any) => children }));

vi.mock('../../src/auth/ForgotPassword', () => ({ default: () => <div>forgot-page</div> }));
vi.mock('../../src/auth/Login', () => ({ default: () => <div>login-page</div> }));
vi.mock('../../src/auth/Verification', () => ({ default: () => <div>verify-page</div> }));
vi.mock('../../src/auth/ResetPassword', () => ({ default: () => <div>reset-page</div> }));

import AppRouter from '../../src/router/AppRouter';

describe('AppRouter (smoke)', () => {
  it('renders public forgot-password route', () => {
    window.history.pushState({}, '', '/forgot-password');
    render(<AppRouter />);
    expect(screen.getByText('forgot-page')).toBeInTheDocument();
  });
});
