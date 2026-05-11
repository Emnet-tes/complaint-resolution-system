import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';

import Organizations from '../../src/pages/Organizations';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../src/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: any) => selector({ sysAdmin: { organizations: [], orgAdmins: [], orgHeads: [], loading: false, submitting: false, error: null } }),
}));
vi.mock('../../src/components/Modal', () => ({ default: ({ isOpen, title, children }: any) => (isOpen ? <div><h2>{title}</h2>{children}</div> : null) }));

describe('Organizations smoke', () => {
  it('renders the organizations title', () => {
    render(<Organizations />);
    expect(screen.getByText('orgs.title')).toBeInTheDocument();
  });
});
