describe('Password Reset Flow', () => {
  it('should allow user to request OTP via email', () => {
    cy.visit('/login');
    cy.contains('button', /forgot password/i).click();
    cy.url().should('include', '/forgot-password');

    cy.get('input[type="email"]').type('user@example.com');

    cy.intercept('POST', '**/auth/forgot-password-otp', {
      statusCode: 200,
      body: { message: 'OTP sent successfully' },
    }).as('otpRequest');

    cy.contains('button', /^OTP$/i).click();
    cy.wait('@otpRequest');

    cy.url().should('include', '/verify-code');
    cy.contains(/verify|verification|code/i).should('be.visible');
    cy.screenshot('doc-password-reset-otp-sent');
  });

  it('should verify OTP and reset password end-to-end', () => {
    cy.visit('/forgot-password');
    cy.get('input[type="email"]').type('user@example.com');
    cy.intercept('POST', '**/auth/forgot-password-otp', {
      statusCode: 200,
      body: { message: 'OTP sent' },
    }).as('otp');
    cy.contains('button', /^OTP$/i).click();
    cy.wait('@otp');

    cy.get('input[placeholder*="123456"], input[type="text"]').first().type('123456');
    cy.contains('button', 'Confirm').click();

    cy.url().should('include', '/reset-password');

    cy.get('input[type="password"]').eq(0).type('NewPassword123!');
    cy.get('input[type="password"]').eq(1).type('NewPassword123!');

    cy.intercept('POST', '**/auth/reset-password-otp', {
      statusCode: 200,
      body: { message: 'Password reset successful' },
    }).as('resetPass');

    cy.contains('button', 'Confirm').click();
    cy.wait('@resetPass');

    cy.url().should('include', '/login');
    cy.contains(/success|reset/i).should('be.visible');
    cy.screenshot('doc-password-reset-complete');
  });
});
