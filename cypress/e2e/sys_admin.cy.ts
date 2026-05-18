describe('SysAdmin Functionality', () => {
  beforeEach(() => {
    cy.login('SysAdmin');
  });

  it('should display dashboard statistics', () => {
    cy.url().should('include', '/dashboard');
    cy.contains('120', { timeout: 30000 }).should('be.visible');
    cy.contains('30').should('be.visible');
    cy.screenshot('doc-sysadmin-dashboard');
  });

  it('should manage organizations', () => {
    cy.intercept('GET', '**/organizations', [
      { _id: '1', name: 'Health Dept', code: 'HLT', isActive: true, createdAt: '', updatedAt: '' },
      { _id: '2', name: 'Transport Dept', code: 'TRN', isActive: true, createdAt: '', updatedAt: '' },
    ]).as('getOrgs');
    cy.intercept('GET', '**/users/org-admins', []).as('getAdmins');
    cy.intercept('GET', '**/users/org-heads', []).as('getHeads');

    cy.contains('aside button', 'Organizations').click();
    cy.wait(['@getOrgs', '@getAdmins', '@getHeads']);

    cy.contains('Health Dept').should('be.visible');
    cy.screenshot('doc-sysadmin-organizations-list');

    cy.contains('button', 'New Organization').click();
    cy.contains('h3', 'New Organization').parents('[class*="rounded-2xl"]').last().within(() => {
      cy.get('input').eq(0).type('New Org');
      cy.get('input').eq(1).type('NEWORG');
    });

    cy.intercept('POST', '**/organizations', {
      statusCode: 201,
      body: { _id: '3', name: 'New Org', code: 'NEWORG', isActive: true, createdAt: '', updatedAt: '' },
    }).as('createOrg');

    cy.contains('h3', 'New Organization').parents('[class*="rounded-2xl"]').last().within(() => {
      cy.contains('button', 'Save').click();
    });
    cy.wait('@createOrg');
    cy.contains('New Org').should('be.visible');
    cy.screenshot('doc-sysadmin-organization-created');
  });

  it('should view audit logs', () => {
    cy.intercept('GET', '**/audit-logs/activities*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: 'a1',
            user: { _id: 'u1', fullName: 'Admin', email: 'admin@example.com' },
            action: 'LOGIN',
            description: 'User signed in',
            targetType: null,
            targetId: null,
            oldValue: null,
            newValue: null,
            orgId: null,
            status: 'SUCCESS',
            errorMessage: null,
            ip: '127.0.0.1',
            adminRole: 'SysAdmin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      },
    }).as('getAuditActivities');

    cy.intercept('GET', '**/audit-logs/summary', {
      statusCode: 200,
      body: {
        success: true,
        summary: {
          totalActiveAdmins: 2,
          last30Days: { userManagementActions: 1, organizationChanges: 0, departmentChanges: 0 },
          recentActivities: [],
        },
      },
    }).as('getAuditSummary');

    cy.contains('aside button', 'Audit Logs').click();
    cy.wait(['@getAuditActivities', '@getAuditSummary']);
    cy.contains('LOGIN').should('be.visible');
    cy.screenshot('doc-sysadmin-audit-logs');
  });
});
