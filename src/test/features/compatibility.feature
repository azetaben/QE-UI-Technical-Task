@holiday_entitlement @compatibility
Feature: Provide consistent holiday calculations across supported browsers

  @COMP-01 @P2 @requires_confirmation
  Scenario Outline: Complete core journeys in supported browsers
    Given the supported browser versions and device matrix have been approved
    And I open the GOV.UK holiday entitlement calculator in <browser> on <device>
    When I complete representative regular and irregular-worker journeys
    And I exercise required-field and invalid-input validation
    Then navigation and validation should remain usable
    And the calculations should match the approved reference results
    And I should record the browser version and device with the evidence

    Examples:
      | browser | device  |
      | Chrome  | desktop |
      | Edge    | desktop |
      | Firefox | desktop |
      | Safari  | desktop |
      | Chrome  | mobile  |
      | Safari  | mobile  |
