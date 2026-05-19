import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';

import OrgHeadDashboard from '../../src/pages/OrgHeadDashboard';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: any) => selector({ orgHead: { analytics: { summary: { totalDepartments: 1, totalComplaints: 2, resolvedComplaints: 1, pendingComplaints: 1, overallResolutionRate: 50, staleComplaints: 0, avgResolutionTimeHours: 3 }, departments: [], recommendations: [], insights: { topPerformers: [], problemDepartments: [], monthlyTrends: [] } }, loading: false, error: null } }),
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
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
}));

describe('OrgHeadDashboard smoke', () => {
  it('renders the org head dashboard title', () => {
    render(<OrgHeadDashboard />);
    expect(screen.getByText('org_dashboard.title')).toBeInTheDocument();
  });
});
