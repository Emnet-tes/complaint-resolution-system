describe('OrgAdmin Functionality', () => {
  beforeEach(() => {
    cy.login('OrgAdmin');
  });

  it('should display organization dashboard', () => {
    cy.url().should('include', '/org-dashboard');
    cy.contains('3', { timeout: 30000 }).should('be.visible');
    cy.contains('45').should('be.visible');
    cy.screenshot('doc-orgadmin-dashboard');
  });

  it('should manage departments', () => {
    cy.intercept('GET', '**/departments', [
      {
        _id: '1',
        name: 'Finance',
        code: 'FIN',
        description: 'Finance',
        head: 'h1',
        organization: { _id: 'org1', name: 'Org' },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: '2',
        name: 'HR',
        code: 'HR',
        description: 'HR',
        head: 'h2',
        organization: { _id: 'org1', name: 'Org' },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]).as('getDepts');
    cy.intercept('GET', '**/users/dept-heads', []).as('getDeptHeads');

    cy.contains('aside button', 'Departments').click();
    cy.wait(['@getDepts', '@getDeptHeads']);

    cy.contains('Finance').should('be.visible');
    cy.screenshot('doc-orgadmin-departments-list');

    cy.contains('button', 'Add Department').click();
    cy.contains('h3', /new department/i).parents('[class*="rounded-2xl"]').last().within(() => {
      cy.get('input').eq(0).type('Marketing');
      cy.get('input').eq(1).type('MKT');
      cy.get('input').eq(2).type('head-id-placeholder');
      cy.get('textarea').type('Marketing department');
    });

    cy.intercept('POST', '**/departments', {
      statusCode: 201,
      body: {
        _id: '3',
        name: 'Marketing',
        code: 'MKT',
        description: 'Marketing department',
        head: 'head-id-placeholder',
        organization: { _id: 'org1', name: 'Org' },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }).as('createDept');

    cy.contains('h3', /new department/i).parents('[class*="rounded-2xl"]').last().within(() => {
      cy.contains('button', 'Finalize Department').click();
    });
    cy.wait('@createDept');
    cy.contains('Marketing').should('be.visible');
    cy.screenshot('doc-orgadmin-department-created');
  });
});
