import '@testing-library/jest-dom';
import { afterEach, afterAll, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Start the MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset any runtime handlers between tests
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Clean up after the test suite
afterAll(() => server.close());
