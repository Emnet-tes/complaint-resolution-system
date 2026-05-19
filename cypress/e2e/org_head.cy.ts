import { stubOrgHeadComplaint } from '../support/api-stubs';

describe('OrgHead Functionality', () => {
  beforeEach(() => {
    cy.login('OrgHead');
  });

  it('should view organization analytics', () => {
    cy.url().should('include', '/org-head/dashboard');
    cy.contains('24', { timeout: 30000 }).should('be.visible');
    cy.contains('Finance').should('be.visible');
    cy.screenshot('doc-orghead-dashboard');
  });

  it('should view and comment on complaints', () => {
    const complaint = stubOrgHeadComplaint;
    cy.intercept('GET', '**/complaints/organization', [complaint]).as('getOrgComplaints');
    cy.intercept('GET', '**/departments', []).as('getDeptsOh');
    cy.intercept('GET', '**/users/dept-heads', []).as('getHeadsOh');

    cy.contains('aside button', 'Complaints').click();
    cy.wait(['@getOrgComplaints', '@getDeptsOh', '@getHeadsOh']);
    cy.contains('Late response').should('be.visible');
    cy.screenshot('doc-orghead-complaints-list');

    let commentPostDone = false;
    cy.intercept('GET', `**/complaints/${complaint._id}/comments`, (req) => {
      req.reply({
        statusCode: 200,
        body: commentPostDone
          ? [
              {
                _id: 'c1',
                commentText: 'Please look into this',
                author: { fullName: 'Org Head' },
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
      });
    }).as('commentsDyn');

    cy.intercept('POST', `**/complaints/${complaint._id}/comments`, (req) => {
      commentPostDone = true;
      req.reply({ statusCode: 201, body: { message: 'ok' } });
    }).as('addComment');

    cy.contains('button', 'View Details').click();
    cy.wait('@commentsDyn');
    cy.contains('Detailed description').should('be.visible');
    cy.screenshot('doc-orghead-complaint-detail');

    cy.get('textarea[placeholder*="Write"], textarea[placeholder*="comment"]').first().type('Please look into this');
    cy.contains('button', 'Post Comment').click();
    cy.wait('@addComment');
    cy.wait('@commentsDyn');
    cy.contains('Please look into this').should('be.visible');
    cy.screenshot('doc-orghead-comment-added');
  });
});
