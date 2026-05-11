import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import Users from '../../src/components/Users';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { fullname: 'Admin User', role: 'OrgAdmin' }, loading: false, login: vi.fn(), logout: vi.fn(), refreshProfile: vi.fn() }),
}));

describe('Users component', () => {
  it('renders department management heading', () => {
    render(<Users />);
    expect(screen.getByText('Department Management')).toBeInTheDocument();
  });
});
