/// <reference types="cypress" />

import { Method } from 'cypress/types/net-stubbing';
import {
  stubDeptHeadAnalytics,
  stubOrgAdminAnalytics,
  stubOrgHeadAnalytics,
  stubSysAdminAnalytics,
  stubDeptHeadComplaints,
} from './api-stubs';

declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: string): Chainable<void>;
      logout(): Chainable<void>;
      interceptAPI(method: Method, path: string, response: unknown): Chainable<null>;
      /** Register GET stubs so post-login dashboards do not hit the real API. */
      stubAuthenticatedApis(role: string): Chainable<void>;
    }
  }
}

function emailForRole(role: string) {
  if (role === 'SysAdmin') return 'sysadmin@complaint.gov';
  if (role === 'OrgAdmin') return 'admin@eep.com.et';
  if (role === 'OrgHead') return 'orghead@eep.com.et';
  if (role === 'DeptHead') return 'power.outage@eep.com.et';
  return `${role.toLowerCase()}@example.com`;
}

Cypress.Commands.add('stubAuthenticatedApis', (role: string) => {
  const email = emailForRole(role);

  cy.intercept('GET', '**/notifications**', {
    statusCode: 200,
    body: { notifications: [], unreadCount: 0 }
  }).as('stubNotifications');

  cy.intercept('GET', '**/auth/profile', {
    statusCode: 200,
    body: {
      user: {
        fullName: `Test ${role}`,
        fullname: `Test ${role}`,
        email,
        role,
      },
    },
  }).as('stubProfile');

  // Common intercepts for complaints and comments to support detail views
  cy.intercept('GET', '**/complaints/assigned', {
    statusCode: 200,
    body: role === 'DeptHead' ? stubDeptHeadComplaints : []
  }).as('stubDeptComplaints');

  cy.intercept('GET', '**/analytics/org-head', {
    statusCode: 200,
    body: stubOrgHeadAnalytics
  }).as('stubOrgHeadComplaints');

  cy.intercept('GET', '**/complaints/*/comments', {
    statusCode: 200,
    body: []
  }).as('stubComments');

  if (role === 'SysAdmin') {
    cy.intercept('GET', '**/analytics/sys-admin', stubSysAdminAnalytics).as('stubSysAnalytics');
  } else if (role === 'OrgAdmin') {
    cy.intercept('GET', '**/analytics/org-admin', stubOrgAdminAnalytics).as('stubOrgAdminAnalytics');
  } else if (role === 'OrgHead') {
    cy.intercept('GET', '**/analytics/org-head', stubOrgHeadAnalytics).as('stubOrgHeadAnalytics');
  } else if (role === 'DeptHead') {
    cy.intercept('GET', '**/analytics/dept-head', stubDeptHeadAnalytics).as('stubDeptHeadAnalytics');
  }

  cy.intercept('POST', '**/auth/logout', { statusCode: 200, body: { message: 'ok' } }).as('stubLogout');
});

Cypress.Commands.add('login', (role = 'SysAdmin') => {
  const email = emailForRole(role);

  cy.clearAllCookies();
  cy.clearLocalStorage();
  cy.visit('/login');
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
  cy.get('input[type="email"]', { timeout: 30000 }).should('be.visible');

  cy.stubAuthenticatedApis(role);

  cy.intercept('POST', '**/auth/login', {
    statusCode: 200,
    body: {
      token: 'fake-token-e2e',
      refreshToken: 'fake-refresh-e2e',
      role,
      fullName: `Test ${role}`,
      email,
    },
  }).as('loginRequest');

  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type('password123');
  cy.get('button[type="submit"]').click();
  cy.wait('@loginRequest');
});

Cypress.Commands.add('logout', () => {
  cy.get('aside').within(() => {
    cy.contains('button', /log\s*out/i).click();
  });
});

Cypress.Commands.add('interceptAPI', (method: Method, path: string, response: unknown) => {
  return cy.intercept(method, `**${path}`, response);
});

export {};
