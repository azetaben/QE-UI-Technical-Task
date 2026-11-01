@holiday_entitlement @search
Feature: Find the holiday calculator using GOV.UK search

  @SEARCH-01 @P1 @smoke
  Scenario: Search for and open the holiday calculator
    Given I open the GOV.UK holiday entitlement calculator
    When I search GOV.UK for "calculate holiday entitlement"
    Then the search results should include "Calculate holiday entitlement"
    When I open the search result "Calculate holiday entitlement"
    Then the holiday calculator landing page should be displayed

  @SEARCH-02 @P2
  Scenario: Keep search separate from calculator questions
    Given I open the GOV.UK holiday entitlement calculator
    And I have started the calculator
    When I open site-wide search
    Then the site-wide search input should be available
    And the worker-type question should remain unanswered
