import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LanguageProvider, useLanguage } from '../../src/context/LanguageContext';

const Consumer = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <p>{language}</p>
      <p>{t('login')}</p>
      <button type="button" onClick={() => setLanguage('AM')}>
        switch
      </button>
    </div>
  );
};

describe('LanguageContext', () => {
  it('switches language and translates keys', async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );

    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'switch' }));

    expect(screen.getByText('AM')).toBeInTheDocument();
    expect(screen.getByText('ይግቡ')).toBeInTheDocument();
  });
});
