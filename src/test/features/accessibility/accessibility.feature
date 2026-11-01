@holiday_entitlement @accessibility
Feature: Make the holiday calculator accessible

  Background:
    Given I open the GOV.UK holiday entitlement calculator

  @ACC-01 @P1
  Scenario Outline: Complete a journey using only a keyboard
    When I complete a representative <worker> journey using only the keyboard
    Then all controls should be reachable and operable
    And keyboard focus should be visible and logically ordered

    Examples:
      | worker          |
      | regular         |
      | irregular-hours |


  @ACC-02 @P2
  Scenario Outline: Reflow the calculator at narrow widths and high zoom
    Given the browser is configured for <display>
    When I complete a journey including an error and a result
    Then the content should reflow
    And controls, errors and results should remain usable without clipping

    Examples:
      | display                  |
      | a narrow mobile viewport |

    @manual
    Examples: Native browser zoom requires a real browser zoom check
      | display                  |
      | 400 percent browser zoom |

  @ACC-03 @P1
  Scenario Outline: Pass an automated WCAG 2.2 AA scan at each journey stage
    When I reach the calculator <stage>
    Then the page should have no automatically detectable WCAG 2.2 AA violations

    Examples:
      | stage            |
      | landing page     |
      | first question   |
      | validation error |
      | result           |
