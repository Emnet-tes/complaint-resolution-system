describe('Settings & Profile', () => {
  beforeEach(() => {
    cy.login('SysAdmin');
    cy.url().should('include', '/dashboard');
  });

  it('should view profile on settings', () => {
    // Navigate via UI to avoid SPA reload
    cy.get('aside').contains(/profile|settings/i).click();
    cy.contains('Account Settings', { timeout: 30000 }).should('be.visible');
    cy.get('input').should('satisfy', ($els) => {
      const vals = $els.map((i, el) => Cypress.$(el).val()).get();
      return vals.some(val => typeof val === 'string' && val.toLowerCase() === 'sysadmin@complaint.gov');
    });
    cy.screenshot('doc-settings-profile-view');
  });

  it('should update password with validation', () => {
    cy.get('aside').contains(/profile|settings/i).click();
    cy.contains('Account Settings', { timeout: 30000 }).should('be.visible');

    cy.contains('h3', /password security/i)
      .parents('section')
      .first()
      .within(() => {
        cy.get('input[type="password"]').eq(0).type('oldPass123');
        cy.get('input[type="password"]').eq(1).type('newPass123');
        cy.get('input[type="password"]').eq(2).type('differentPass');
        cy.contains('button', 'Update Password').click();
      });

    cy.contains(/match|do not match|passwords/i).should('be.visible');
    cy.screenshot('doc-settings-password-validation-error');

    cy.intercept('POST', '**/auth/change-password', {
      statusCode: 200,
      body: { message: 'Password updated successfully' },
    }).as('updatePass');

    cy.contains('h3', /password security/i)
      .parents('section')
      .first()
      .within(() => {
        cy.get('input[type="password"]').eq(2).clear().type('newPass123');
        cy.contains('button', 'Update Password').click();
      });

    cy.wait('@updatePass');
    cy.contains(/password|changed|success/i).should('be.visible');
    cy.screenshot('doc-settings-password-update-success');
  });
});
