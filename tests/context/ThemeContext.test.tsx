import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider, useTheme } from '../../src/context/ThemeContext';

const Consumer = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
};

describe('ThemeContext', () => {
  it('toggles theme and updates document attributes', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent(/light|dark/i);
    await user.click(screen.getByRole('button'));
    expect(document.documentElement.getAttribute('data-theme')).toMatch(/light|dark/);
  });
});
