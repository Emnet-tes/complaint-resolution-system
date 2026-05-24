import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { authApi } from '../../src/api/api';

// ── Mock js-cookie so tests don't need a real browser environment ────────────
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(() => 'mock-token'),
    remove: vi.fn(),
    set: vi.fn(),
  },
}));

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('returns the authenticated user profile', async () => {
      const res = await authApi.getProfile();
      expect(res.data).toMatchObject({
        _id: 'user-1',
        email: 'test@example.com',
        role: 'OrgHead',
      });
    });

    it('throws when the API returns 401', async () => {
      server.use(
        http.get(
          `${import.meta.env.VITE_API_URL}/auth/profile`,
          () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
        ),
      );

      // The axios interceptor catches 401 and removes cookies.
      // At minimum the promise should reject.
      await expect(authApi.getProfile()).rejects.toBeTruthy();
    });

    it('refreshes the access token and retries when the profile request returns 401 once', async () => {
      let profileCalls = 0;

      server.use(
        http.get(`${import.meta.env.VITE_API_URL}/auth/profile`, () => {
          profileCalls += 1;
          if (profileCalls === 1) {
            return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
          }

          return HttpResponse.json({
            _id: 'user-1',
            email: 'test@example.com',
            role: 'OrgHead',
          });
        }),
      );

      const res = await authApi.getProfile();
      expect(res.data).toMatchObject({
        _id: 'user-1',
        email: 'test@example.com',
        role: 'OrgHead',
      });
      expect(profileCalls).toBe(2);
    });
  });

  describe('forgotPassword', () => {
    it('sends a POST to /auth/forgot-password', async () => {
      const res = await authApi.forgotPassword('user@example.com');
      expect(res.data).toMatchObject({ message: 'Reset link sent' });
    });
  });

  describe('forgotPasswordOtp', () => {
    it('sends a POST to /auth/forgot-password-otp', async () => {
      const res = await authApi.forgotPasswordOtp('user@example.com');
      expect(res.data).toMatchObject({ message: 'OTP sent' });
    });
  });

  describe('resetPassword', () => {
    it('sends a POST to /auth/reset-password with token payload', async () => {
      const res = await authApi.resetPassword({
        token: 'tok',
        email: 'user@example.com',
        password: 'newpass',
      });
      expect(res.data).toMatchObject({ message: 'Password reset' });
    });
  });

  describe('resetPasswordOtp', () => {
    it('sends a POST to /auth/reset-password-otp with otp payload', async () => {
      const res = await authApi.resetPasswordOtp({
        email: 'user@example.com',
        otp: '123456',
        password: 'newpass',
      });
      expect(res.data).toMatchObject({ message: 'Password reset' });
    });
  });

  describe('changePassword', () => {
    it('resolves with success message', async () => {
      const res = await authApi.changePassword({
        oldPassword: 'old',
        newPassword: 'new',
      });
      expect(res.data).toMatchObject({ message: 'Password changed successfully' });
    });

    it('rejects on API error', async () => {
      server.use(
        http.post(
          `${import.meta.env.VITE_API_URL}/auth/change-password`,
          () => HttpResponse.json({ message: 'Wrong password' }, { status: 400 }),
        ),
      );
      await expect(
        authApi.changePassword({ oldPassword: 'x', newPassword: 'y' }),
      ).rejects.toBeTruthy();
    });
  });

  describe('logout', () => {
    it('resolves with logout confirmation', async () => {
      const res = await authApi.logout();
      expect(res.data).toMatchObject({ message: 'Logged out' });
    });
  });

  describe('refreshToken', () => {
    it('returns new accessToken and refreshToken', async () => {
      const res = await authApi.refreshToken('mock-refresh-token');
      expect(res.data).toMatchObject({
        accessToken: 'mock-access-token-refreshed',
        refreshToken: 'mock-refresh-token-refreshed',
        expiresIn: 900,
      });
    });
  });
});
