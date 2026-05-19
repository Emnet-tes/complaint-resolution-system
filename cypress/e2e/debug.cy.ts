describe('Debug Settings', () => {
  it('should capture console errors', () => {
    let logs = [];
    cy.on('window:before:load', (win) => {
      cy.spy(win.console, 'error').as('consoleError');
      cy.spy(win.console, 'warn').as('consoleWarn');
    });

    cy.login('SysAdmin');
    cy.visit('/settings');
    cy.wait(5000); // give it time to crash

    cy.get('@consoleError').then((consoleError) => {
      // @ts-ignore
      const calls = consoleError.getCalls().map(c => c.args.join(' '));
      cy.writeFile('cypress/e2e/debug_errors.txt', calls.join('\n'));
    });
  });
});
