import { describe, it, expect, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Complaints from '../../src/components/Complaints';

vi.mock('../../src/components/Modal', () => ({ default: ({ isOpen, title }: any) => (isOpen ? <div>{title}</div> : null) }));

describe('Complaints smoke', () => {
  it('renders the complaints heading', () => {
    render(
      <MemoryRouter>
        <Complaints />
      </MemoryRouter>,
    );

    expect(screen.getByText('All City Complaints')).toBeInTheDocument();
  });
});
