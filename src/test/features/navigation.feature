@holiday_entitlement @navigation
Feature: Navigate GOV.UK holiday guidance

  Background:
    Given I open the GOV.UK holiday entitlement calculator

  @NAV-01 @P2
  Scenario: Show the calculator introduction and breadcrumb hierarchy
    Then the calculator should explain full-year and part-year calculations
    And the breadcrumbs should identify the statutory leave section

  @NAV-02 @P2
  Scenario: Expand and collapse the site navigation
    Then the header should link to the GOV.UK homepage
    When I expand and collapse the site navigation menu
    Then the calculator landing page should still be usable

  @NAV-03 @P2
  Scenario: Link to related holiday guidance and topics
    Then the related content should link to holiday entitlement guidance
    And the topic navigation should link to statutory leave and time off
