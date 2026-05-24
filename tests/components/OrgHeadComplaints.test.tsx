import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../helpers/testUtils';
import OrgHeadComplaints from '../../src/components/OrgHeadComplaints';

// Mock Leaflet components because they require an actual DOM with size dimensions
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({ children }: any) => <div data-testid="circle-marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    fitBounds: vi.fn(),
    setView: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
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

describe('OrgHeadComplaints component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => renderWithProviders(<OrgHeadComplaints />);

  it('fetches and renders complaints in a table', async () => {
    renderComponent();
    
    // Check loading indicator or wait for data
    expect(screen.getByText('org_head_complaints.title')).toBeInTheDocument();
    
    // MSW mock returns "Test Complaint"
    await waitFor(() => {
      expect(screen.getByText('Test Complaint')).toBeInTheDocument();
    });
    
    expect(screen.getByText('A test complaint')).toBeInTheDocument();
    expect(screen.getAllByText('Submitted')[0]).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('switches to map view and renders map components', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Wait for initial fetch
    await waitFor(() => {
      expect(screen.getByText('Test Complaint')).toBeInTheDocument();
    });

    const mapBtn = screen.getByRole('button', { name: /org_head_complaints.map_view/i });
    await user.click(mapBtn);

    // Instead of table, we should see map container
    expect(screen.queryByText('complaints.table.title_desc')).not.toBeInTheDocument();
    
    // Because the MSW mock doesn't have coordinates, we will see the no_location placeholder
    expect(screen.getByText('org_head_complaints.no_location')).toBeInTheDocument();
  });

  it('filters complaints by search term', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Complaint')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('org_head_complaints.search_placeholder');
    
    // Type something that doesn't match
    await user.type(searchInput, 'XYZ123NonExistent');

    await waitFor(() => {
      expect(screen.queryByText('Test Complaint')).not.toBeInTheDocument();
      expect(screen.getByText('org_head_complaints.no_data')).toBeInTheDocument();
    });

    // Clear and type something that matches
    await user.clear(searchInput);
    await user.type(searchInput, 'Test Complaint');

    await waitFor(() => {
      expect(screen.getByText('Test Complaint')).toBeInTheDocument();
      expect(screen.queryByText('org_head_complaints.no_data')).not.toBeInTheDocument();
    });
  });

  it('filters complaints by status', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Complaint')).toBeInTheDocument(); // Mock status is 'Submitted'
    });

    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects[0]; // The first select is the status filter

    // Filter for 'Resolved'
    await user.selectOptions(statusSelect, 'Resolved');

    await waitFor(() => {
      expect(screen.queryByText('Test Complaint')).not.toBeInTheDocument();
      expect(screen.getByText('org_head_complaints.no_data')).toBeInTheDocument();
    });

    // Filter for 'Submitted'
    await user.selectOptions(statusSelect, 'Submitted');

    await waitFor(() => {
      expect(screen.getByText('Test Complaint')).toBeInTheDocument();
    });
  });

  it('opens override modal and submits override successfully', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Complaint')).toBeInTheDocument();
    });

    const overrideBtn = screen.getByRole('button', { name: /org_head_complaints.override/i });
    await user.click(overrideBtn);

    // Modal should be open
    expect(screen.getByText('org_head_complaints.override_title')).toBeInTheDocument();

    // Change status
    const selects = screen.getAllByRole('combobox');
    // selects[0] is main filter, selects[1] is department in modal, selects[2] is priority, selects[3] is status in modal
    const modalStatusSelect = selects[3];
    
    await user.selectOptions(modalStatusSelect, 'Rejected');

    const submitBtn = screen.getByRole('button', { name: /org_head_complaints.apply_override/i });
    await user.click(submitBtn);

    // We rely on toast or modal close to verify success
    await waitFor(() => {
      expect(screen.queryByText('org_head_complaints.override_title')).not.toBeInTheDocument();
    });
  });

  it('navigates to details view when view details is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Complaint')).toBeInTheDocument();
    });

    const viewDetailsBtn = screen.getByRole('button', { name: /complaints.table.view_details/i });
    await user.click(viewDetailsBtn);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/complaints/c1'),
      expect.objectContaining({ state: expect.objectContaining({ source: 'org' }) })
    );
  });
});
