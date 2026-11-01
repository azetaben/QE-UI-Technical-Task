@holiday_entitlement @positive
Feature: Calculate holiday entitlement for valid inputs
  Workers receive the statutory entitlement appropriate to their work pattern.

  Background:
    Given I open the GOV.UK holiday entitlement calculator

  @POS-01 @P1 @smoke @contract
  Scenario: Start the calculator
    When I select Start now
    Then I should be asked whether the employee works irregular hours or for part of the year
    And Yes and No choices and a Continue button should be available

  @POS-02 @P1
  Scenario: Follow the regular-worker route
    Given I have started the calculator
    When I answer No to irregular-hours or part-year working
    And I continue
    Then I should be shown the relevant regular-worker questions

  @POS-03 @P1
  Scenario: Follow the irregular-hours or part-year route
    Given I have started the calculator
    When I answer Yes to irregular-hours or part-year working
    And I continue
    Then I should be asked for information needed for the applicable accrual calculation

  @POS-04 @P1 @smoke @contract
  Scenario: Full-year entitlement for a five-day week
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter 5 working days per week and complete the calculation
    Then the entitlement should be 28 days

  @POS-05 @P1
  Scenario: Full-year entitlement for a three-day week
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter 3 working days per week and complete the calculation
    Then the entitlement should be 16.8 days

  @POS-06 @P1
  Scenario: Full-year entitlement for a one-day week
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter 1 working day per week and complete the calculation
    Then the entitlement should be 5.6 days

  @POS-07 @P1
  Scenario: Full-year entitlement expressed in hours
    Given the hours-based route has been confirmed as supported
    And I am calculating a regular worker's entitlement for a full leave year
    When I enter 35 working hours over 5 working days per week
    And I complete the calculation
    Then the entitlement should be 196 hours
    And the result should clearly identify the unit as hours

  @POS-08 @P1
  Scenario: Start employment partway through the leave year
    Given approved starter dates, work pattern, accrual rules and an independent numeric expected result are available
    When I complete the starter journey with those dates and work pattern
    Then the entitlement should match the approved independent result

  @POS-09 @P1
  Scenario: Leave employment partway through the leave year
    Given approved leaver dates, work pattern, accrual rules and an independent numeric expected result are available
    When I complete the leaver journey with those dates and work pattern
    Then the entitlement should match the approved independent result
    And it should not exceed the equivalent full-year entitlement

  @POS-10 @P1
  Scenario: Start and leave employment within the same leave year
    Given the combined starter-and-leaver route has been confirmed as supported
    And approved dates within one leave year and an independent numeric expected result are available
    When I complete the combined journey with those dates and work pattern
    Then the entitlement should match the approved independent result using both employment dates

  @POS-11 @P1 @smoke @contract
  Scenario: Accrue leave for thirty hours worked
    Given I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026
    When I enter 30 hours worked in one pay period and complete the calculation
    Then the entitlement should be 4 hours

  @POS-12 @P1
  Scenario: Accrue leave for one hundred hours worked
    Given I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026
    When I enter 100 hours worked in one pay period and complete the calculation
    Then the entitlement should be 12 hours

  @POS-13 @P1
  Scenario: Recalculate after changing a previous answer
    Given I have a full-year regular-worker result of 28 days for a five-day week
    When I change the working-days answer to 3 using the available change control
    And I complete the calculation
    Then the entitlement should be 16.8 days
    And the displayed working-days answer should be 3

  @POS-14 @P2
  Scenario: Restart after completing a calculation
    Given I have completed a calculation
    When I use the available restart control
    Then a new calculator journey should begin
    And the previous answers should not affect the new calculation

