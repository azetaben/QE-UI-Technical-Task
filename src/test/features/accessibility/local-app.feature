@local_app @suite:LocalAccessibility @owner:QE
Feature: Local accessibility exercise
  The supplied contact page should load locally and remain usable for everyone.
  Known accessibility defects are reported as failures, never as expected passes.

  Background:
    Given the local accessibility exercise is open

  @LOCAL-01 @local_smoke
  Scenario: Local assets load and the fields support keyboard entry
    When I complete the local contact fields using only the keyboard
    Then the local Done button should have keyboard focus

  @LOCAL-02 @accessibility
  Scenario: Automated WCAG and best-practice audit
    Then the local page should pass the automated accessibility audit

  @LOCAL-03 @accessibility
  Scenario: Content reflows at 320 CSS pixels
    When the local viewport is narrowed to 320 CSS pixels
    Then the local form and illustration should fit without clipping

  @LOCAL-04 @accessibility
  Scenario: Field labels remain available after entering values
    When I complete the local contact fields using only the keyboard
    Then the populated local fields should retain visible associated labels
