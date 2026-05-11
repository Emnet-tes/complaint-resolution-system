import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';

import DepartmentManagement from '../../src/pages/DepartmentManagement';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: any) => selector({ orgAdmin: { departments: [], deptHeads: [], loading: false, submitting: false, error: null } }),
}));
vi.mock('../../src/components/Table', () => ({ Table: ({ noDataMessage }: any) => <div>{noDataMessage}</div> }));
vi.mock('../../src/components/Modal', () => ({ default: ({ isOpen, title, children }: any) => (isOpen ? <div><h2>{title}</h2>{children}</div> : null) }));

describe('DepartmentManagement smoke', () => {
  it('renders the department management title', () => {
    render(<DepartmentManagement />);
    expect(screen.getByText('dept_mgmt.title')).toBeInTheDocument();
  });
});
