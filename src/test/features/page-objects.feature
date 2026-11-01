@page_objects
Feature: Reusable calculator page actions
  Page-specific steps share bindings for common controls and preserve existing journeys.

  Background:
    Given I open the GOV.UK holiday entitlement calculator

  Scenario: Inspect and change the worker type selection
    When I select Start now
    Then the "worker type" calculator page should be displayed
    And the "worker type" calculator page should explain its question
    And the "worker type" calculator page should have the expected form configuration
    And the worker type page should have no selection
    When I select Yes on the worker type page
    Then only Yes should be selected on the worker type page
    When I select No on the worker type page
    Then only No should be selected on the worker type page
    When I continue from the "worker type" calculator page
    Then the "regular hours" calculator page should be displayed
    And the "regular hours" calculator page should explain its question

  Scenario Outline: Select a regular-worker calculation basis
    Given I have started the calculator
    When I answer No to irregular-hours or part-year working
    And I continue
    And I select calculation basis "<basis>" on the "regular hours" page
    Then calculation basis "<basis>" should be selected on the "regular hours" page
    When I continue from the "regular hours" calculator page
    Then the "leave year period" calculator page should be displayed
    And all four leave year periods should be available
    And no leave year period should be selected
    When I select leave year period "full-year"
    Then leave year period "full-year" should be selected
    When I continue from the "leave year period" calculator page
    Then the "<next page>" calculator page should be displayed

    Examples:
      | basis                 | next page             |
      | days worked per week  | days worked per week  |
      | hours worked per week | hours worked per week |
      | compressed hours      | compressed hours      |

  Scenario: Inspect and change annualised hours
    Given I have started the calculator
    When I answer No to irregular-hours or part-year working
    And I continue
    And I select calculation basis "annualised hours" on the "regular hours" page
    And I continue from the "regular hours" calculator page
    Then the "annualised hours" calculator page should be displayed
    When I change the annualised hours calculation basis
    Then the calculator question key should be "basis-of-calculation"

  Scenario: Fill and clear weekly days before completing a result
    Given I am calculating a regular worker's entitlement for a full leave year
    When I fill "3" on the "days worked per week" numeric page
    Then the "days worked per week" numeric page should retain "3"
    When I clear the "days worked per week" numeric page
    Then the "days worked per week" numeric page should retain ""
    When I fill "5" on the "days worked per week" numeric page
    And I continue from the "days worked per week" calculator page
    Then the result page should be displayed
    And the entitlement should be 28 days
    And the result page should contain 4 changeable answers
    And the result page should explain the entitlement guidance
    And the entitlement statement should be "The statutory holiday entitlement is 28 days holiday."
    And the answer summary should contain "Number of days worked per week?" with answer "5.0"
    When I change result answer "Number of days worked per week?"
    Then the "days worked per week" calculator page should be displayed

  Scenario: Retain an invalid weekly days answer and allow correction
    Given I am calculating a regular worker's entitlement for a full leave year
    Then the "days worked per week" input page should have no validation errors
    When I fill "8" on the "days worked per week" numeric page
    And I continue from the "days worked per week" calculator page
    Then the "days worked per week" input page should show validation error "7 days"
    And the "days worked per week" numeric page should retain "8"
    When I fill "5" on the "days worked per week" numeric page
    And I continue from the "days worked per week" calculator page
    Then the entitlement should be 28 days

  Scenario: Fill compressed hours and change the calculation basis
    Given I have started the calculator
    When I answer No to irregular-hours or part-year working
    And I continue
    And I select calculation basis "compressed hours" on the "regular hours" page
    And I continue from the "regular hours" calculator page
    And I select leave year period "full-year"
    And I continue from the "leave year period" calculator page
    And I fill "40" on the "compressed hours" numeric page
    Then the "compressed hours" numeric page should retain "40"
    When I change the compressed hours calculation basis
    Then the calculator question key should be "basis-of-calculation"

  Scenario: Complete the weekly hours and working days pages
    Given I have started the calculator
    When I answer No to irregular-hours or part-year working
    And I continue
    And I select calculation basis "hours worked per week" on the "regular hours" page
    And I continue from the "regular hours" calculator page
    And I select leave year period "full-year"
    And I continue from the "leave year period" calculator page
    And I fill "35" on the "hours worked per week" numeric page
    Then the "hours worked per week" numeric page should retain "35"
    When I continue from the "hours worked per week" calculator page
    Then the "days worked per week for hours" calculator page should be displayed
    When I fill "5" on the "days worked per week for hours" numeric page
    Then the "days worked per week for hours" numeric page should retain "5"
    When I continue from the "days worked per week for hours" calculator page
    Then the entitlement should be 196 hours

  Scenario: Fill and clear the irregular-worker leave year date
    Given I have started the calculator
    When I answer Yes to irregular-hours or part-year working
    And I continue
    Then the "irregular hours" calculator page should be displayed
    When I fill day "1", month "4" and year "2026" on the "irregular hours" date page
    Then the "irregular hours" date page should retain day "1", month "4" and year "2026"
    When I clear the "irregular hours" date page
    Then the "irregular hours" date page should retain day "", month "" and year ""
    When I fill day "1", month "4" and year "2026" on the "irregular hours" date page
    And I continue from the "irregular hours" calculator page
    Then the "hours in pay period" calculator page should be displayed
    When I fill "30" on the "hours in pay period" numeric page
    Then the "hours in pay period" numeric page should retain "30"
    When I continue from the "hours in pay period" calculator page
    Then the entitlement should be 4 hours

  Scenario Outline: Fill and clear employment dates
    Given I have started the calculator
    When I answer No to irregular-hours or part-year working
    And I continue
    And I select calculation basis "days worked per week" on the "regular hours" page
    And I continue from the "regular hours" calculator page
    And I select leave year period "<period>"
    And I continue from the "leave year period" calculator page
    Then the "<page>" calculator page should be displayed
    When I fill day "1", month "7" and year "2026" on the "<page>" date page
    Then the "<page>" date page should retain day "1", month "7" and year "2026"
    When I clear the "<page>" date page
    Then the "<page>" date page should retain day "", month "" and year ""

    Examples:
      | period   | page                  |
      | starting | employment start date |
      | leaving  | employment end date   |

  Scenario: Inspect an irregular-worker historical calculation basis
    Given I have started the calculator
    When I answer Yes to irregular-hours or part-year working
    And I continue
    And I fill day "31", month "3" and year "2024" on the "irregular hours" date page
    And I continue from the "irregular hours" calculator page
    Then the "calculation basis" calculator page should be displayed
    And the calculation basis page should offer all five options
    And the calculation basis page should have no selection
    And the "calculation basis" calculator page should have the expected form configuration

  Scenario: Inspect the landing page navigation and supporting content
    Then the landing page should list the supported leave year options
    And the landing page should show all related content links
    And the landing page should show both explore topic links
    And the breadcrumb link "Home" should point to "/"
    And the related content link "Holiday entitlement" should point to "/holiday-entitlement-rights"
    When I open the navigation menu
    Then the navigation menu should be open
    And the navigation menu should show its service and government sections
    And the navigation menu link "Benefits" should point to "/browse/benefits"
    When I close the navigation menu
    Then the navigation menu should be closed
    And the footer should be displayed with licence and copyright information
    And the footer link "Help" should point to "/help"
    And the feedback prompt should be in its initial state
