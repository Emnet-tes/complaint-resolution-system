import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';

import OrgDashboard from '../../src/pages/OrgDashboard';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: any) => selector({ orgAdmin: { analytics: { summary: { totalDepartments: 1, totalDepartmentHeads: 1, activeDepartmentHeads: 1, inactiveDepartmentHeads: 0, departmentsWithHeads: 1, departmentsWithoutHeads: 0, departmentsWithActiveHeads: 1, departmentsWithInactiveHeads: 0, systemHealthScore: 100 }, departments: [] }, loading: false } }),
}));
vi.mock('../../src/components/OrgComponents', () => ({ StatCard: ({ title }: any) => <div>{title}</div> }));
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Legend: () => null,
}));

describe('OrgDashboard smoke', () => {
  it('renders the org dashboard title', () => {
    render(<OrgDashboard />);
    expect(screen.getByText('org_dashboard.title')).toBeInTheDocument();
  });
});
