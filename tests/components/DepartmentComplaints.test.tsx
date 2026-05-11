import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../helpers/testUtils';
import DepartmentComplaints from '../../src/components/DepartmentComplaints';

// Mock translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DepartmentComplaints component', () => {
  let originalCreateObjectURL: typeof URL.createObjectURL;

  beforeEach(() => {
    vi.clearAllMocks();
    originalCreateObjectURL = global.URL.createObjectURL;
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
  });

  afterEach(() => {
    global.URL.createObjectURL = originalCreateObjectURL;
  });

  const renderComponent = () => renderWithProviders(<DepartmentComplaints />);

  it('renders loading state initially or fetches data', async () => {
    renderComponent();
    
    // Check if the title is rendered
    expect(screen.getByText('dept_complaints.title')).toBeInTheDocument();
    
    // Wait for MSW to return the data (2 complaints mocked in handlers)
    await waitFor(() => {
      expect(screen.getByText('Network Issue')).toBeInTheDocument();
    });
    
    // It should render both complaints from MSW
    expect(screen.getByText('Network Issue')).toBeInTheDocument();
    expect(screen.getByText('Printer broken')).toBeInTheDocument();
    
    // Check stats (2 total, 1 pending, 1 resolved)
    // Wait for the stat cards to update based on the fetched data
    await waitFor(() => {
      // We look for values inside the stat cards
      const stats = screen.getAllByRole('heading', { level: 3 }); // Assuming StatCard uses h3 for value, wait let's just find by text
      expect(screen.getByText('2')).toBeInTheDocument(); // total
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // resolved / pending
    });
  });

  it('switches between list and map views', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Default is list view
    await waitFor(() => {
      expect(screen.getByText('dept_complaints.table.id')).toBeInTheDocument();
    });

    // Click map view button
    const mapBtn = screen.getByRole('button', { name: /dept_complaints.map_view/i });
    await user.click(mapBtn);

    // List headers should disappear, map placeholder should appear
    expect(screen.queryByText('dept_complaints.table.id')).not.toBeInTheDocument();
    
    // Looking for the map placeholder text
    const mapPlaceholders = screen.getAllByText('dept_complaints.map_view');
    // One is the button, one is the placeholder
    expect(mapPlaceholders.length).toBeGreaterThanOrEqual(2);

    // Switch back to list view
    const listBtn = screen.getByRole('button', { name: /dept_complaints.list_view/i });
    await user.click(listBtn);
    expect(screen.getByText('dept_complaints.table.id')).toBeInTheDocument();
  });

  it('filters complaints by status', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Network Issue')).toBeInTheDocument();
      expect(screen.getByText('Printer broken')).toBeInTheDocument();
    });

    // Find the status select dropdown
    const select = screen.getByRole('combobox');
    
    // Filter for 'Resolved'
    await user.selectOptions(select, 'Resolved');

    // Network issue (Submitted) should disappear, Printer broken (Resolved) should stay
    await waitFor(() => {
      expect(screen.queryByText('Network Issue')).not.toBeInTheDocument();
      expect(screen.getByText('Printer broken')).toBeInTheDocument();
    });

    // Filter for 'Submitted'
    await user.selectOptions(select, 'Submitted');

    await waitFor(() => {
      expect(screen.getByText('Network Issue')).toBeInTheDocument();
      expect(screen.queryByText('Printer broken')).not.toBeInTheDocument();
    });
  });

  it('navigates to complaint details when clicking view details', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Network Issue')).toBeInTheDocument();
    });

    // Click the first "view details" button
    const viewButtons = screen.getAllByText('dept_complaints.table.view_details');
    await user.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalled();
    // Path should include /complaints/c1 (c1 is from mock handler)
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/complaints/c1'),
      expect.any(Object)
    );
  });

  it('handles CSV export functionality', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Network Issue')).toBeInTheDocument();
    });

    // We can't fully test the browser download prompt, but we can verify our mock was called
    const exportBtn = screen.getByRole('button', { name: /dept_complaints.export/i });
    
    // Mock anchor click
    const mockClick = vi.fn();
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tag) => {
      const element = originalCreateElement.call(document, tag);
      if (tag === 'a') {
        element.click = mockClick;
      }
      return element;
    });

    await user.click(exportBtn);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    // Restore
    document.createElement = originalCreateElement;
  });
});
