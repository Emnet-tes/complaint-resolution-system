import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import Verification from '../../src/auth/Verification';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }) }));
vi.mock('../../src/components/ThemeToggle', () => ({ default: () => <div data-testid="theme-toggle" /> }));

describe('Verification smoke', () => {
  it('renders the verification title', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/verify-code', state: { email: 'test@example.com' } }]}>
        <Verification />
      </MemoryRouter>,
    );
    expect(screen.getByText('auth.verify_code_title')).toBeInTheDocument();
  });
});
