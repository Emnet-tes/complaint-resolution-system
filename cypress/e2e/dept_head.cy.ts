import { stubAssignedDeptComplaint } from '../support/api-stubs';

describe('DeptHead Functionality', () => {
  beforeEach(() => {
    cy.login('DeptHead');
  });

  it('should view department dashboard', () => {
    cy.url().should('include', '/dept-dashboard');
    cy.contains('15', { timeout: 30000 }).should('be.visible');
    cy.screenshot('doc-depthead-dashboard');
  });

  it('should resolve a complaint', () => {
    const row = stubAssignedDeptComplaint;
    cy.intercept('GET', '**/complaints/assigned', [row]).as('getDeptComplaints');

    cy.contains('aside button', 'Complaints').click();
    cy.wait('@getDeptComplaints');
    cy.contains('Payment issue').should('be.visible');
    cy.screenshot('doc-depthead-complaints-list');

    cy.contains('button', 'View Details').click();

    cy.contains('Payment did not post').should('be.visible');
    cy.screenshot('doc-depthead-complaint-detail');

    cy.intercept('PUT', `**/complaints/${row._id}/status`, {
      statusCode: 200,
      body: { message: 'ok' },
    }).as('updateStatus');

    cy.contains(/update status/i).scrollIntoView();
    cy.contains(/update status/i).parent().find('select').first().select('Resolved', { force: true });
    cy.contains('button', 'Save').click();
    cy.wait('@updateStatus');
    cy.contains(/resolved/i).should('be.visible');
    cy.screenshot('doc-depthead-complaint-resolved');
  });
});
