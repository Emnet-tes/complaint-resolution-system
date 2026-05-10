import { describe, it, expect } from 'vitest';
import authReducer, {
  setCredentials,
  setUser,
  setAuthLoading,
  clearAuth,
  selectAuth,
  selectCurrentUser,
  selectUserRole,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthSubmitting,
  selectAuthError,
  forgotPasswordThunk,
  resetPasswordThunk,
  changePasswordThunk,
  getProfileThunk,
} from '../../../src/store/slices/authSlice';
import { createTestStore } from '../../helpers/testUtils';

// ─── Shared fixtures ────────────────────────────────────────────────────────
const mockUser = {
  fullname: 'Jane Doe',
  email: 'jane@example.com',
  role: 'OrgHead' as const,
};

const initialState = {
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,
  loading: true,
  submitting: false,
  error: null,
};

// ─── Reducer unit tests ─────────────────────────────────────────────────────
describe('authSlice reducer', () => {
  it('returns the initial state when called with undefined state', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('setCredentials', () => {
    it('stores token, user, role, isAuthenticated=true and loading=false', () => {
      const state = authReducer(
        undefined,
        setCredentials({ token: 'abc', user: mockUser }),
      );

      expect(state.token).toBe('abc');
      expect(state.user).toEqual(mockUser);
      expect(state.role).toBe('OrgHead');
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });
  });

  describe('setUser', () => {
    it('updates user and role', () => {
      const base = { ...initialState, token: 'abc', isAuthenticated: true };
      const state = authReducer(base as any, setUser(mockUser));

      expect(state.user).toEqual(mockUser);
      expect(state.role).toBe('OrgHead');
    });

    it('sets isAuthenticated=false when user is null but token exists', () => {
      const base = { ...initialState, token: 'abc', isAuthenticated: true };
      const state = authReducer(base as any, setUser(null));

      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setAuthLoading', () => {
    it('sets loading to true', () => {
      const state = authReducer({ ...initialState, loading: false } as any, setAuthLoading(true));
      expect(state.loading).toBe(true);
    });

    it('sets loading to false', () => {
      const state = authReducer({ ...initialState, loading: true } as any, setAuthLoading(false));
      expect(state.loading).toBe(false);
    });
  });

  describe('clearAuth', () => {
    it('resets all auth fields to their cleared values', () => {
      const populated = {
        token: 'abc',
        user: mockUser,
        role: 'OrgHead' as const,
        isAuthenticated: true,
        loading: true,
        submitting: true,
        error: 'some error',
      };
      const state = authReducer(populated, clearAuth());

      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.role).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.submitting).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});

// ─── Selectors ──────────────────────────────────────────────────────────────
describe('authSlice selectors', () => {
  const store = createTestStore({
    auth: {
      token: 'tok',
      user: mockUser,
      role: 'OrgHead',
      isAuthenticated: true,
      loading: false,
      submitting: true,
      error: 'oops',
    },
  });

  const state = store.getState();

  it('selectAuth returns the entire auth slice', () => {
    expect(selectAuth(state).token).toBe('tok');
  });

  it('selectCurrentUser returns the user object', () => {
    expect(selectCurrentUser(state)).toEqual(mockUser);
  });

  it('selectUserRole returns the role string', () => {
    expect(selectUserRole(state)).toBe('OrgHead');
  });

  it('selectIsAuthenticated returns true', () => {
    expect(selectIsAuthenticated(state)).toBe(true);
  });

  it('selectAuthLoading returns false', () => {
    expect(selectAuthLoading(state)).toBe(false);
  });

  it('selectAuthSubmitting returns true', () => {
    expect(selectAuthSubmitting(state)).toBe(true);
  });

  it('selectAuthError returns the error string', () => {
    expect(selectAuthError(state)).toBe('oops');
  });
});

// ─── Async thunks (via MSW) ──────────────────────────────────────────────────
describe('authSlice async thunks', () => {
  describe('getProfileThunk', () => {
    it('sets loading=true while pending', async () => {
      const store = createTestStore();
      const promise = store.dispatch(getProfileThunk());
      // Immediately after dispatch the state should be loading
      expect(store.getState().auth.loading).toBe(true);
      await promise;
    });

    it('populates user on fulfilled', async () => {
      const store = createTestStore({ auth: { ...initialState, loading: true } as any });
      await store.dispatch(getProfileThunk());
      expect(store.getState().auth.user).not.toBeNull();
      expect(store.getState().auth.loading).toBe(false);
    });
  });

  describe('forgotPasswordThunk (otp mode)', () => {
    it('sets submitting=true while pending', async () => {
      const store = createTestStore();
      const promise = store.dispatch(
        forgotPasswordThunk({ email: 'a@b.com', mode: 'otp' }),
      );
      expect(store.getState().auth.submitting).toBe(true);
      await promise;
    });

    it('sets submitting=false on fulfilled', async () => {
      const store = createTestStore();
      await store.dispatch(forgotPasswordThunk({ email: 'a@b.com', mode: 'otp' }));
      expect(store.getState().auth.submitting).toBe(false);
    });
  });

  describe('forgotPasswordThunk (link mode)', () => {
    it('sets submitting=false on fulfilled', async () => {
      const store = createTestStore();
      await store.dispatch(forgotPasswordThunk({ email: 'a@b.com', mode: 'link' }));
      expect(store.getState().auth.submitting).toBe(false);
    });
  });

  describe('changePasswordThunk', () => {
    it('clears error and sets submitting=false on success', async () => {
      const store = createTestStore({
        auth: { ...initialState, error: 'old error' } as any,
      });
      await store.dispatch(
        changePasswordThunk({ oldPassword: 'old', newPassword: 'new' }),
      );
      expect(store.getState().auth.submitting).toBe(false);
      expect(store.getState().auth.error).toBeNull();
    });
  });

  describe('resetPasswordThunk', () => {
    it('fulfils with token mode', async () => {
      const store = createTestStore();
      const result = await store.dispatch(
        resetPasswordThunk({ mode: 'token', token: 'tok', email: 'a@b.com', password: 'new' }),
      );
      expect(result.meta.requestStatus).toBe('fulfilled');
    });

    it('fulfils with otp mode', async () => {
      const store = createTestStore();
      const result = await store.dispatch(
        resetPasswordThunk({ mode: 'otp', email: 'a@b.com', otp: '123456', password: 'new' }),
      );
      expect(result.meta.requestStatus).toBe('fulfilled');
    });
  });
});
