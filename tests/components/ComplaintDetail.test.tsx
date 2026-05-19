import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ComplaintDetail from '../../src/components/ComplaintDetail';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'DeptHead' } }),
}));

vi.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => vi.fn(() => ({ unwrap: vi.fn() })),
}));

vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })));

const mockComplaint = {
  _id: 'c1',
  title: 'Test Complaint',
  description: 'Details',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'Submitted',
  location: { locationName: 'Somewhere', coordinates: ['0', '0'] },
  department: { name: 'Dept', code: 'DP' },
};

describe('ComplaintDetail (smoke)', () => {
  it('renders when provided via route state', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/complaints/c1', state: { complaint: mockComplaint } }]}>
        <ComplaintDetail />
      </MemoryRouter>,
    );
    expect(screen.getByText('Test Complaint')).toBeInTheDocument();
  });
});
