import './commands';

beforeEach(() => {
  cy.intercept('GET', '**/Ethiopia_AdminBoundaries.geojson*', {
    fixture: 'empty-geojson.json',
  }).as('stubWoredaGeojson');
});
