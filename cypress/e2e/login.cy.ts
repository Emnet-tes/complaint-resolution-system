describe('Login & Logout Flow', () => {
  const roles = ['SysAdmin', 'OrgAdmin', 'OrgHead', 'DeptHead'] as const;

  roles.forEach((role) => {
    it(`should allow ${role} to login and logout`, () => {
      cy.login(role);
      cy.url().should('not.include', '/login');
      cy.get('aside').should('be.visible');
      cy.screenshot(`doc-login-${role}-authed`);
      cy.logout();
      cy.url().should('include', '/login');
      cy.screenshot(`doc-login-${role}-logged-out`);
    });
  });

  it('should show error on invalid login', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginFail');

    cy.visit('/login');
    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');
    cy.contains(/invalid/i).should('be.visible');
    cy.screenshot('doc-login-invalid-credentials');
  });
});
