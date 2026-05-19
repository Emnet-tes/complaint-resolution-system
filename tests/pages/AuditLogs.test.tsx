import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../helpers/testUtils';
import AuditLogs from '../../src/pages/AuditLogs';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AuditLogs component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => renderWithProviders(<AuditLogs />);

  it('fetches and renders audit logs and summary on mount', async () => {
    renderComponent();
    
    // Check loading indicator or wait for title
    expect(screen.getByText('audit_logs.title')).toBeInTheDocument();
    
    // Summary data assertions
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // active admins
    });
    
    expect(screen.getAllByText('10')[0]).toBeInTheDocument(); // user actions
    expect(screen.getByText('2')).toBeInTheDocument(); // org changes
    expect(screen.getByText('3')).toBeInTheDocument(); // dept changes
    
    // Table data assertions (from page 1 mock)
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    expect(screen.getByText('User login on page 1')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('handles pagination correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('User login on page 1')).toBeInTheDocument();
    });

    // Click Next
    const nextBtn = screen.getByRole('button', { name: /audit_logs.next/i });
    await user.click(nextBtn);

    // Verify it fetches page 2
    await waitFor(() => {
      expect(screen.getByText('User login on page 2')).toBeInTheDocument();
      expect(screen.queryByText('User login on page 1')).not.toBeInTheDocument();
    });

    // Click Previous
    const prevBtn = screen.getByRole('button', { name: /audit_logs.previous/i });
    await user.click(prevBtn);

    // Verify it fetches page 1 again
    await waitFor(() => {
      expect(screen.getByText('User login on page 1')).toBeInTheDocument();
    });
  });

  it('handles page size changes', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('User login on page 1')).toBeInTheDocument();
    });

    const pageSizeSelect = screen.getByRole('combobox');
    
    // Change page size to 50
    await user.selectOptions(pageSizeSelect, '50');

    // It should refetch page 1 with new limit (we check if page 1 loads since our mock just returns page 1)
    await waitFor(() => {
      expect(screen.getByText('User login on page 1')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('User login on page 1')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /audit_logs.refresh/i });
    
    // We can't easily mock a slow network here, but we can verify the button is clickable
    await user.click(refreshBtn);

    // Data should still be there after refresh
    await waitFor(() => {
      expect(screen.getByText('User login on page 1')).toBeInTheDocument();
    });
  });
});
