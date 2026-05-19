import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ThemeToggle from '../../src/components/ThemeToggle';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const toggleThemeMock = vi.fn();
vi.mock('../../src/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: toggleThemeMock }),
}));

describe('ThemeToggle', () => {
  it('renders and calls toggleTheme on click', async () => {
    const user = userEvent.setup();

    render(<ThemeToggle />);

    const btn = screen.getByRole('button', { name: /theme.toggle/i });
    await user.click(btn);

    expect(toggleThemeMock).toHaveBeenCalled();
  });
});
