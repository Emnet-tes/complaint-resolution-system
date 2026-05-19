# Component Testing Guide

This guide outlines the standards, structure, and best practices for writing **component tests** in the Complaint Resolution System repository.

---

# Tech Stack

For component testing, we use **React Testing Library** with **user-event** on top of **Vitest**.

Our testing stack includes:

- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- `happy-dom`
- `msw` (Mock Service Worker)

> **Note:** Component tests run in Node using `happy-dom`.  
> Full browser automation and real end-to-end workflows belong in a separate E2E testing layer (e.g., Playwright).

---

# Folder Structure

All component testing documentation and files are organized under the `tests` directory.

```txt
tests/
├── auth/                    # Authentication-related component tests
├── components/              # UI component tests
├── context/                 # React Context tests
├── pages/                   # Page-level component tests
├── store/
│   └── slices/              # Redux slice tests
├── api/                     # API/service tests
├── mocks/                   # MSW handlers and mock server setup
├── helpers/                 # Shared test utilities
├── setup.ts                 # Global Vitest setup
└── COMPONENT-TESTS.md                # Component testing guide
```

---

# Shared Test Utilities

Use the shared helper:

```tsx
renderWithProviders()
```

This helper wraps components with:

- Redux Provider
- MemoryRouter
- preloaded state support

Located in:

```txt
tests/helpers/testUtils.tsx
```

---

# Current Test Coverage Summary

## Latest Test Results

```txt
Test Files: 36 passed
Tests:      145 passed
Duration:   36.89s
```

---

# Current Coverage Report

| Metric | Coverage |
|---|---|
| Statements | 56.13% |
| Branches | 38.62% |
| Functions | 53.36% |
| Lines | 57.69% |

---

# Well-Tested Areas

## Components
- ProtectedRoute
- Settings
- DepartmentComplaints
- OrgHeadComplaints
- ThemeToggle
- Table
- Modal

## Contexts
- AuthContext
- ThemeContext
- LanguageContext
- NotificationContext

## Authentication Flows
- Login
- ForgotPassword
- Verification

## Store Slices
- authSlice
- orgAdminSlice
- deptAdminSlice
- notificationSlice

---

# Remaining High-Priority Untested Areas

## Components
- ComplaintDetail.tsx
- Users.tsx
- Navbar.tsx
- Sidebar.tsx

## Pages
- Dashboard.tsx
- Organizations.tsx
- DepartmentManagement.tsx
- OrgHeadDashboard.tsx

## APIs
- sysadmin.ts
- orgadmin.ts
- depthead.ts

---

# Recommended Coverage Goal

For this project, a practical target is:

| Area | Target |
|---|---|
| Components | 70–80% |
| Store Slices | 80–90% |
| Critical Auth Flows | 90%+ |
| Overall Project | 65–75% |

---

# Best Practices

- Prefer `screen.getByRole()` over `querySelector`
- Test behavior, not implementation
- Use MSW for API mocking
- Keep tests isolated and deterministic
- Create reusable test fixtures
- Avoid testing Redux dispatch directly
- Use accessible queries whenever possible

---

# Summary

Our component testing strategy focuses on:

- user-visible behavior
- realistic interactions
- accessibility-aware queries
- maintainable tests
- isolated UI validation

This keeps the test suite reliable, scalable, and aligned with real user experience.