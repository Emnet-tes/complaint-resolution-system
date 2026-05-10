import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../../src/store/slices/authSlice';
import notificationsReducer from '../../src/store/slices/notificationSlice';
import orgHeadReducer from '../../src/store/slices/orgHeadSlice';
import orgAdminReducer from '../../src/store/slices/orgAdminSlice';
import deptHeadReducer from '../../src/store/slices/deptHeadSlice';
import deptAdminReducer from '../../src/store/slices/deptAdminSlice';
import sysAdminReducer from '../../src/store/slices/sysAdminSlice';
import type { RootState } from '../../src/store';

// ────────────────────────────────────────────────────────────────────────────
// Factory: create a fresh store for each test (avoids state bleed)
// ────────────────────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationsReducer,
  orgHead: orgHeadReducer,
  orgAdmin: orgAdminReducer,
  deptHead: deptHeadReducer,
  deptAdmin: deptAdminReducer,
  sysAdmin: sysAdminReducer,
});

export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as any,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Custom render: wraps with Redux Provider + MemoryRouter
// ────────────────────────────────────────────────────────────────────────────
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, initialEntries = ['/'], ...renderOptions }: CustomRenderOptions = {},
) {
  const store = createTestStore(preloadedState);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// ────────────────────────────────────────────────────────────────────────────
// Shared test fixtures
// ────────────────────────────────────────────────────────────────────────────
export const mockUser = {
  fullname: 'Test User',
  email: 'test@example.com',
  role: 'OrgHead' as const,
};

export const mockAuthState = {
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 900,
  user: mockUser,
  role: 'OrgHead' as const,
  isAuthenticated: true,
  loading: false,
  submitting: false,
  error: null,
};

export const mockNotifications = [
  { _id: 'n1', message: 'New complaint submitted', read: false, createdAt: new Date().toISOString() },
  { _id: 'n2', message: 'Complaint resolved', read: true, createdAt: new Date().toISOString() },
];
