import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Role, User } from '../../types';
import { authApi } from '../../api/api';

interface AuthState {
  token: string | null;        // accessToken (kept as 'token' for selector compatibility)
  refreshToken: string | null;
  expiresIn: number | null;
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  expiresIn: null,
  user: null,
  role: null,
  isAuthenticated: false,
  loading: true,
  submitting: false,
  error: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'response' in error) {
    const maybeResponse = error as { response?: { data?: { message?: string } } };
    return maybeResponse.response?.data?.message || fallback;
  }
  return fallback;
};

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: { email: string; mode: 'otp' | 'link' }, { rejectWithValue }) => {
    try {
      if (payload.mode === 'otp') {
        const res = await authApi.forgotPasswordOtp(payload.email);
        return res.data;
      }
      const res = await authApi.forgotPassword(payload.email);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to submit forgot password request'));
    }
  },
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (
    payload:
      | { mode: 'token'; token: string; email: string; password: string }
      | { mode: 'otp'; email: string; otp: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      if (payload.mode === 'token') {
        const res = await authApi.resetPassword({
          token: payload.token,
          email: payload.email,
          password: payload.password,
        });
        return res.data;
      }

      const res = await authApi.resetPasswordOtp({
        email: payload.email,
        otp: payload.otp,
        password: payload.password,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to reset password'));
    }
  },
);

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (payload: { oldPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.changePassword(payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to change password'));
    }
  },
);

export const getProfileThunk = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.getProfile();
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch profile'));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Accepts the flat login response: { _id, role, accessToken, refreshToken, expiresIn }
    // plus an optional pre-fetched user object for profile-driven updates.
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user?: User;
        role?: Role;
      }>,
    ) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiresIn = action.payload.expiresIn;
      if (action.payload.user) {
        state.user = action.payload.user;
        state.role = action.payload.user.role;
      } else if (action.payload.role) {
        state.role = action.payload.role as Role;
      }
      state.isAuthenticated = true;
      state.loading = false;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.role = action.payload?.role ?? null;
      state.isAuthenticated = !!(state.token && action.payload);
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.expiresIn = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.submitting = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfileThunk.rejected, (state) => {
        state.loading = false;
      })
      .addMatcher(
        (action) =>
          (action.type.startsWith('auth/forgotPassword') ||
            action.type.startsWith('auth/resetPassword') ||
            action.type.startsWith('auth/changePassword')) &&
          action.type.endsWith('/pending'),
        (state) => {
          state.submitting = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          (action.type.startsWith('auth/forgotPassword') ||
            action.type.startsWith('auth/resetPassword') ||
            action.type.startsWith('auth/changePassword')) &&
          action.type.endsWith('/fulfilled'),
        (state) => {
          state.submitting = false;
        },
      )
      .addMatcher(
        (action) =>
          (action.type.startsWith('auth/forgotPassword') ||
            action.type.startsWith('auth/resetPassword') ||
            action.type.startsWith('auth/changePassword')) &&
          action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.submitting = false;
          state.error = (action.payload as string) || 'Authentication request failed';
        },
      );
  },
});

export const { setCredentials, setUser, setAuthLoading, clearAuth } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectUserRole = (state: RootState) => state.auth.role;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthSubmitting = (state: RootState) => state.auth.submitting;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;