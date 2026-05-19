import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';

import Dashboard from '../../src/pages/Dashboard';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: any) => selector({ sysAdmin: { analytics: { overview: { total: 1, resolved: 1, pending: 0, resolvedPercentage: 100, avgResolutionTimeHours: 2, staleComplaints: 0, inactiveDepartmentHeads: 0, monthlyGrowthRate: 0 }, organizations: { all: [], topPerformers: [], needsImprovement: [] }, recommendations: [], trends: { monthly: [] }, alerts: [] }, loading: false } }),
}));
vi.mock('../../src/components/StatCard', () => ({ default: ({ title }: any) => <div>{title}</div> }));
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Legend: () => null,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
}));

describe('Dashboard smoke', () => {
  it('renders the system dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText('sys_dashboard.title')).toBeInTheDocument();
  });
});
