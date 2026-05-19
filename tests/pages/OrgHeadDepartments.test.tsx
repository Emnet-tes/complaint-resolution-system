import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';

import OrgHeadDepartments from '../../src/pages/OrgHeadDepartments';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: any) => selector({ orgHead: { loading: false, departments: [], deptHeads: [], error: null } }),
}));
vi.mock('../../src/components/Table', () => ({ Table: ({ noDataMessage }: any) => <div>{noDataMessage}</div> }));

describe('OrgHeadDepartments smoke', () => {
  it('renders the org head departments title', () => {
    render(<OrgHeadDepartments />);
    expect(screen.getByText('org_head_departments.title')).toBeInTheDocument();
  });
});
