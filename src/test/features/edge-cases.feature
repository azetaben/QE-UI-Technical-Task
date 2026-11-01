@holiday_entitlement @edge
Feature: Handle holiday entitlement boundaries and journey state

  Background:
    Given I open the GOV.UK holiday entitlement calculator

  @EDGE-01 @P1
  Scenario Outline: Apply the statutory day cap
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter <days> working days per week and complete the calculation
    Then the entitlement should be 28 days

    Examples:
      | days |
      | 5    |
      | 6    |
      | 7    |

  @EDGE-02 @P1
  Scenario Outline: Handle zero according to the field-specific rule
    Given I am on the <field> question
    When I enter "0" and continue
    Then zero should be rejected for that field

    Examples:
      | field                       |
      | working days per week       |
      | hours worked per pay period |

  @EDGE-03 @P1
  Scenario: Handle fractional working days
    Given I am calculating a regular worker's entitlement for a full leave year
    When I enter 2.5 working days per week and complete the calculation
    Then the entitlement should be 14 days

  @EDGE-04 @P1 @requires_confirmation
  Scenario Outline: Enforce documented numeric limits
    Given every numeric field's minimum, maximum and smallest accepted increment have been approved
    When I submit <boundary> for each numeric field in a fresh journey
    Then each submission should be <outcome>

    Examples:
      | boundary                    | outcome  |
      | the minimum                 | accepted |
      | the maximum                 | accepted |
      | one increment below minimum | rejected |
      | one increment above maximum | rejected |

  @EDGE-05 @P1
  Scenario Outline: Round accrual on either side of a half-hour threshold
    Given I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026
    When I enter <worked> hours worked in one pay period and complete the calculation
    Then the entitlement should be <leave> hours

    Examples:
      | worked | leave |
      | 28     | 3     |
      | 29     | 4     |

  @EDGE-06 @P1
  Scenario Outline: Round decimal-hour accrual near the threshold
    Given decimal hours have been confirmed as supported
    And I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026
    When I enter <worked> hours worked in one pay period and complete the calculation
    Then the entitlement should be <leave> hours

    Examples:
      | worked | leave |
      | 12.42  | 1     |
      | 12.43  | 2     |

  @EDGE-07 @P1
  Scenario Outline: Select the correct rule at the historical cutoff
    Given the employee works irregular hours or for part of the year
    When I enter a leave-year start date of <start_date>
    And I continue
    Then the journey should apply the <rule> entitlement rules

    Examples:
      | start_date    | rule                  |
      | 31 March 2024 | historical pre-cutoff |
      | 1 April 2024  | pay-period accrual    |

  # A first-day starter uses the full-year route rather than the part-year route.
  @EDGE-08 @P1
  Scenario: Start on the first day of the leave year
    Given approved starter rules allow comparison with a full-year result
    When I calculate entitlement for a regular worker starting on the first day of the leave year
    Then the entitlement should equal the equivalent full-year calculation

  @EDGE-09 @P1
  Scenario: Leave on the last day of the leave year
    Given a regular worker was employed throughout the leave year
    When I calculate entitlement using the leaver route with the last day of that leave year
    Then the entitlement should equal the equivalent full-year calculation

  @EDGE-10 @P1 @requires_confirmation
  Scenario Outline: Calculate a minimal employment period
    Given approved dates, accrual rules and an independent numeric expected result exist for <period>
    When I calculate entitlement using those dates
    Then the entitlement should match the approved independent result
    And no negative or erroneous full-year entitlement should be displayed

    Examples:
      | period                                          |
      | employment starting on the final leave-year day |
      | a supported one-day employment period           |

  @EDGE-11 @P1
  Scenario: Accept a leap day and calculate across it
    Given approved leap-year dates, work pattern and an independent numeric expected result are available
    When I enter a valid date of 29 February 2024
    Then that date should be accepted
    When I complete the calculation for the approved period crossing that leap day
    Then the entitlement should match the approved independent result

  @EDGE-12 @P1
  Scenario: Calculate across a calendar-year boundary
    Given approved employment dates, work pattern and an independent numeric expected result are available
    When I calculate entitlement for a leave year from 1 April 2026 to 31 March 2027
    Then the entitlement should match the approved independent result for that leave year

  @EDGE-13 @P1
  Scenario: Discard irrelevant answers after switching worker type
    Given I have answered questions on one worker-type branch
    When I navigate Back and select the other worker type
    And I complete the new branch with valid answers
    Then the result should use only answers relevant to the new branch

  @EDGE-14 @P2
  Scenario Outline: Preserve a coherent journey through browser navigation
    Given I have reached a calculator <page>
    When I refresh the page
    And I navigate using browser Back and Forward
    Then the displayed answers and any result should remain consistent
    And the journey should remain usable

    Examples:
      | page     |
      | question |
      | result   |

  @EDGE-15 @P2 @requires_confirmation
  Scenario Outline: Handle alternative numeric formats
    Given the accepted numeric-format rules have been approved
    And I am on a suitable numeric question
    When I submit the numeric format <format> and continue
    Then supported formats should be normalised according to those rules
    And unsupported formats should receive a clear validation error
    And the value should not be silently misinterpreted

    Examples:
      | format                             |
      | 5 with leading whitespace          |
      | 5 with trailing whitespace         |
      | 05 with a leading zero             |
      | 3,5 with a comma decimal separator |

