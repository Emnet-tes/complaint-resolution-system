import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders, mockAuthState } from '../helpers/testUtils';
import ProtectedRoute from '../../src/components/ProtectedRoute';

describe('ProtectedRoute', () => {
  const renderProtectedRoute = (preloadedAuthState = {}, allowedRoles = ['SysAdmin']) => {
    return renderWithProviders(
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        <Route path="/unauthorized" element={<div data-testid="unauth-page">Unauth Page</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={allowedRoles as any}>
              <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      {
        preloadedState: {
          auth: { ...mockAuthState, ...preloadedAuthState },
        },
      }
    );
  };

  it('renders a loading indicator when auth is loading', () => {
    renderProtectedRoute({ loading: true });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    renderProtectedRoute({ loading: false, isAuthenticated: false });
    // Navigate will push to /login
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to /unauthorized when user role is not allowed', () => {
    renderProtectedRoute({
      loading: false,
      isAuthenticated: true,
      role: 'OrgHead',
    }, ['SysAdmin']); // OrgHead is not SysAdmin

    expect(screen.getByTestId('unauth-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated and role is allowed', () => {
    renderProtectedRoute({
      loading: false,
      isAuthenticated: true,
      role: 'SysAdmin',
    }, ['SysAdmin', 'OrgAdmin']);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('unauth-page')).not.toBeInTheDocument();
  });
});
