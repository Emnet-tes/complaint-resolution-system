import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LanguageSwitcher from '../../src/language/LanguageSwitcher';
import { LanguageProvider } from '../../src/context/LanguageContext';

describe('LanguageSwitcher smoke', () => {
  it('toggles the language label', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('English');
  });
});
