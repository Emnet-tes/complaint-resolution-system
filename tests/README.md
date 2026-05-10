# Testing — Complaint Resolution System

> **61 tests · 5 files · all passing** · ~6 s

---

## Table of Contents

- [Tooling](#tooling)
- [Folder Structure](#folder-structure)
- [Test Report](#test-report)
- [Running Tests](#running-tests)
- [Coverage](#coverage)
- [Writing New Tests](#writing-new-tests)
- [MSW – API Mocking](#msw--api-mocking)
- [What To Test vs What To Skip](#what-to-test-vs-what-to-skip)
- [Priority Candidates](#priority-candidates-for-next-tests)

---

## Tooling

| Tool | Version | Role |
|---|---|---|
| [Vitest](https://vitest.dev/) | 4.x | Fast, Vite-native test runner |
| [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) | — | Component render & query utilities |
| [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/) | — | Realistic user interaction simulation |
| [@testing-library/jest-dom](https://testing-library.com/docs/ecosystem-jest-dom/) | — | Custom DOM matchers (`toBeInTheDocument`, etc.) |
| [MSW](https://mswjs.io/) | 2.x | Node-side HTTP interception — no real network calls |
| [happy-dom](https://github.com/capricorn86/happy-dom) | — | Lightweight DOM environment for Vitest |

TypeScript is configured via **`tsconfig.test.json`** at the project root, which extends `tsconfig.app.json` and adds `vitest/globals`, `@testing-library/jest-dom`, and `vite/client` types.

---

## Folder Structure

```
tests/
├── README.md                              ← You are here
├── setup.ts                               ← Global: jest-dom matchers + MSW lifecycle
│
├── mocks/
│   ├── handlers.ts                        ← All MSW HTTP handlers (auth, notifications, orgHead)
│   └── server.ts                          ← MSW Node server — imported by setup.ts
│
├── helpers/
│   └── testUtils.tsx                      ← renderWithProviders(), createTestStore(), shared fixtures
│
├── store/
│   └── slices/
│       ├── authSlice.test.ts              ← 22 tests
│       ├── notificationSlice.test.ts      ← 10 tests
│       └── orgHeadSlice.test.ts          ← 12 tests
│
├── components/
│   └── Settings.test.tsx                  ← 8 tests
│
└── api/
    └── auth.test.ts                       ← 9 tests
```

The `tests/` folder mirrors `src/` one-to-one:

```
src/components/Settings.tsx        →  tests/components/Settings.test.tsx
src/store/slices/authSlice.ts      →  tests/store/slices/authSlice.test.ts
src/api/api.ts                     →  tests/api/auth.test.ts
```

---

## Test Report

```
 RUN  v4.1.5

 ✓ tests/api/auth.test.ts                          ( 10 tests)  ~180ms
 ✓ tests/store/slices/notificationSlice.test.ts   (10 tests)  ~210ms
 ✓ tests/store/slices/orgHeadSlice.test.ts        (12 tests)  ~200ms
 ✓ tests/store/slices/authSlice.test.ts           (22 tests)  ~200ms
 ✓ tests/components/Settings.test.tsx              ( 8 tests) ~2300ms

 Test Files  5 passed (5)
      Tests  62 passed (62)
   Duration  ~6 s
```

### Breakdown by file

| File | Tests | What is covered |
|---|---|---|
| `authSlice.test.ts` | 22 | All 4 sync reducers · 7 selectors · 5 async thunks (`forgotPassword` otp+link, `resetPassword` token+otp, `changePassword`, `getProfile`) |
| `notificationSlice.test.ts` | 10 | `prependNotification` · mark-read · mark-all-read · fetch happy path + MSW error override |
| `orgHeadSlice.test.ts` | 12 | Analytics, directory, override, comments reducer cases · 3 async thunks |
| `Settings.test.tsx` | 8 | Profile render · password-mismatch validation · submit disabled state · MSW success/error paths · eye-toggle |
| `auth.test.ts` | 9 | Every `authApi` method · 401 and 400 rejection paths |

---

## Running Tests

```bash
# Single run (CI / pre-push)
npm test

# Interactive watch mode (development)
npm run test:watch

# One specific file
npx vitest run tests/store/slices/authSlice.test.ts

# All tests matching a name pattern
npx vitest run --reporter=verbose -t "sets loading"
```

---

## Coverage

```bash
npm run test:coverage
```

An HTML report is written to `coverage/index.html`. Coverage is collected from all `src/**/*.{ts,tsx}` excluding:
- `src/main.tsx`, `src/App.tsx`, `src/i18n.ts`
- `src/**/*.d.ts`, `src/locales/**`, `src/assets/**`

---

## Writing New Tests

### New Redux slice → `tests/store/slices/<sliceName>.test.ts`

```ts
import { createTestStore } from '../../helpers/testUtils';
import { myThunk, selectMySlice } from '../../../src/store/slices/mySlice';

describe('mySlice async thunks', () => {
  it('populates data on fulfilled', async () => {
    const store = createTestStore();
    await store.dispatch(myThunk());
    expect(selectMySlice(store.getState()).data).not.toBeNull();
  });
});
```

### New component → `tests/components/<ComponentName>.test.tsx`

```tsx
import { renderWithProviders, mockAuthState } from '../helpers/testUtils';
import MyComponent from '../../src/components/MyComponent';

it('renders the expected heading', () => {
  const { getByRole } = renderWithProviders(<MyComponent />, {
    preloadedState: { auth: { ...mockAuthState } },
  });
  expect(getByRole('heading', { name: /My Title/i })).toBeInTheDocument();
});
```

### Naming conventions

| Source file | Test file | Extension |
|---|---|---|
| `Button.tsx` | `Button.test.tsx` | `.test.tsx` — contains JSX |
| `authSlice.ts` | `authSlice.test.ts` | `.test.ts` — logic only |
| `useComplaint.ts` | `useComplaint.test.ts` | `.test.ts` — hook |
| `api.ts` | `auth.test.ts` | `.test.ts` — logic only |

---

## MSW – API Mocking

All default handlers live in `tests/mocks/handlers.ts` and are registered globally before every test via `tests/setup.ts`. The server is reset after each test (`afterEach(() => server.resetHandlers())`), so per-test overrides never leak.

### Overriding a handler for one test

```ts
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

it('shows an error banner on 500', async () => {
  server.use(
    http.get(
      `${import.meta.env.VITE_API_URL ?? 'https://fallback.example.com/api'}/some-endpoint`,
      () => HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
    ),
  );

  // ...render and interact...

  await waitFor(() => {
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  // Handler is reset automatically after this test
});
```

### Adding a permanent handler

Add entries to the `handlers` array in `tests/mocks/handlers.ts`:

```ts
http.get(`${BASE}/new-endpoint`, () =>
  HttpResponse.json({ data: [] }),
),
```

---

## What To Test vs What To Skip

### ✅ Test these

- Redux slice reducers — state transitions for every action
- Redux async thunks — pending/fulfilled/rejected state changes
- Selectors — correct data projection from state
- Components with logic — form validation, conditional rendering, event dispatch
- API helpers — request shapes, response transformation, error handling
- Permission/role-driven rendering

### ❌ Skip these

- CSS, Tailwind classes, or visual layout
- React / Redux / TypeScript internals
- Third-party library behaviour
- Private implementation details not observable by the user
- Full end-to-end auth flows (those belong in E2E tests)

---

## Priority Candidates for Next Tests

| Priority | Target | What to cover |
|---|---|---|
| 1 | `deptAdminSlice` | Reducers, thunks, selectors |
| 2 | `orgAdminSlice` | Reducers, thunks, selectors |
| 3 | `sysAdminSlice` | Reducers, thunks, selectors |
| 4 | `DepartmentComplaints.tsx` | Filter state, pagination, fetch on mount |
| 5 | `OrgHeadComplaints.tsx` | Override modal open/close, dispatch |
| 6 | `AuditLogs.tsx` | Pagination state, refresh trigger |
| 7 | `ProtectedRoute.tsx` | Redirect per `Role` value |
| 8 | Custom hooks | Polling intervals, caching guards |
