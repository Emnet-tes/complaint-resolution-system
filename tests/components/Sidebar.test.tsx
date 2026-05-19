import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/testUtils';

import Sidebar from '../../src/components/Sidebar';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'SysAdmin' }, logout: vi.fn() }),
}));

describe('Sidebar (smoke)', () => {
  it('renders navigation container', () => {
    renderWithProviders(<Sidebar isMobileOpen={false} setIsMobileOpen={vi.fn()} />);
    expect(screen.getByText('sidebar.sys_portal')).toBeInTheDocument();
  });
});
