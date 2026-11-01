@holiday_entitlement @negative
Feature: Validate invalid holiday entitlement inputs
  Invalid answers receive useful errors and can be corrected.

  Background:
    Given I open the GOV.UK holiday entitlement calculator

  @NEG-01 @P1 @smoke @contract
  Scenario: Require a worker-type answer
    Given I have started the calculator
    When I continue without selecting a worker type
    Then I should remain on the worker-type question
    And a required-selection error should identify the unanswered question

  @NEG-02 @P1
  Scenario: Require a numeric answer
    Given I am on a required numeric question
    When I leave the numeric answer blank and continue
    Then I should receive a recoverable required-field error

  @NEG-03 @P1
  Scenario: Reject alphabetic numeric input
    Given I am on a days-or-hours numeric question
    When I enter "abc" and continue
    Then I should receive a recoverable numeric-entry error

  @NEG-04 @P1
  Scenario: Reject a negative numeric input
    Given I am on a days-or-hours numeric question
    When I enter "-5" and continue
    Then I should receive a recoverable invalid-value error

  @NEG-05 @P1
  Scenario: Reject more than seven working days per week
    Given I am on the working-days-per-week question
    When I enter "8" and continue
    Then I should receive a recoverable error explaining the permitted range

  @NEG-06 @P1
  Scenario: Handle an extremely large number
    Given I am on a required numeric question
    When I enter a number containing 100 digits and continue
    Then I should receive a recoverable invalid-value error
    And no overflow, service crash or calculated result should be displayed

  @NEG-07 @P1
  Scenario Outline: Reject an invalid calendar date
    Given I am on a required date question
    When I enter day <day>, month <month> and year <year> and continue
    Then I should receive a recoverable invalid-date error

    Examples:
      | day | month | year |
      | 31  | 4     | 2026 |
      | 29  | 2     | 2025 |

  @NEG-08 @P1
  Scenario Outline: Reject an incomplete date
    Given I am on a required date question
    When I enter a valid date except for a missing <component> and continue
    Then I should receive a recoverable incomplete-date error
    And the completed date components should be retained

    Examples:
      | component |
      | day       |
      | month     |
      | year      |

  @NEG-09 @P1
  Scenario: Reject leaving employment before starting
    Given the journey requests both employment dates
    When I enter an employment start date of 1 July 2026
    And I enter an employment leaving date of 30 June 2026
    And I continue
    Then I should receive a recoverable error explaining the contradictory dates

  @NEG-10 @P1
  Scenario: Require the leave year to begin before a part-year starter
    Given I am calculating entitlement for someone starting part way through a leave year
    When I enter the same employment and leave-year start date of 1 January 2026
    Then the starter route should explain that the leave year must start earlier
    And I can correct the leave-year start date and continue

  @NEG-11 @P1
  Scenario: Handle script text safely
    Given I am on a text-capable calculator input
    When I enter "<script>alert(1)</script>" and submit the answer
    Then no script should execute
    And the input should be rejected or rendered as literal text

  @NEG-12 @P2
  Scenario Outline: Handle a malformed journey URL
    Given I have a valid calculator journey URL
    When I open that URL after inserting an <invalid_value>
    Then the service should show a recoverable error or a valid restart path
    And no stack trace or unhandled service error should be displayed

    Examples:
      | invalid_value      |
      | unsupported answer |
      | malformed value    |

