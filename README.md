# Complaint Resolution System

A full-stack complaint management platform built with **React 19 · TypeScript · Redux Toolkit · Vite · Tailwind CSS v4**.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
  - [Tooling](#tooling)
  - [Folder Structure](#folder-structure)
  - [Test Report](#test-report)
  - [Running Tests](#running-tests)
  - [Coverage](#coverage)
  - [Writing New Tests](#writing-new-tests)
  - [MSW – API Mocking](#msw--api-mocking)

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## Project Structure

```
src/
├── api/          # Axios clients and API helper functions
├── components/   # Reusable UI components
├── context/      # React context providers (Auth, Theme)
├── layout/       # Shell layout (Sidebar, Navbar)
├── pages/        # Route-level page components
├── router/       # AppRouter and ProtectedRoute
├── services/     # WebSocket / real-time service
├── store/        # Redux store, slices, and typed hooks
├── types/        # Shared TypeScript types (Role, User, …)
└── locales/      # i18n translation files (en / am)

tests/            # Mirror of src/ — all unit & integration tests
```

---

## Environment Variables

Create a `.env` file at the project root (never commit it):

```env
VITE_API_URL=https://your-backend.example.com/api
```

The application and all MSW mock handlers fall back to the production render URL when `VITE_API_URL` is not set.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and produce a production bundle |
| `npm run lint` | Run ESLint across the whole project |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the full test suite once |
| `npm run test:watch` | Run tests in interactive watch mode |
| `npm run test:coverage` | Run tests and generate a V8 coverage report |

---

## Testing

Full testing documentation — tooling, folder structure, live test report, authoring guide, MSW patterns, and coverage — is in **[tests/README.md](./tests/README.md)**.

Quick reference:

```bash
npm test                  # single run
npm run test:watch        # interactive watch mode
npm run test:coverage     # generate HTML coverage report
```

> **Current status: 61 tests · 5 files · all passing**


