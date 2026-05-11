import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';

import DeptDashboard from '../../src/pages/DeptDashboard';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: any) => selector({ deptHead: { analytics: { total: 7, resolved: 4, pending: 3, resolvedPercentage: 57 }, loading: false } }),
}));
vi.mock('../../src/components/StatCard', () => ({ default: ({ title }: any) => <div>{title}</div> }));

describe('DeptDashboard smoke', () => {
  it('renders the department dashboard title', () => {
    render(<DeptDashboard />);
    expect(screen.getByText('dept_dashboard.title')).toBeInTheDocument();
  });
});
