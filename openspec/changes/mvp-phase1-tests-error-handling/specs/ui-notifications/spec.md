# Delta for UI Notifications

## ADDED Requirements

### Requirement: Toast Notifications

The system MUST show toast notifications for user actions.

#### Scenario: Success notification shows on save

- GIVEN user saves a project
- THEN toast shows "Project saved"

#### Scenario: Error notification shows on failure

- GIVEN save operation fails
- THEN toast shows error message, not silent

### Requirement: Error State Components

Pages MUST show error states, not loading forever.

#### Scenario: Data fetch fails shows error

- GIVEN API call returns error
- WHEN page renders
- THEN shows error message with retry button

#### Scenario: Empty state shows guidance

- GIVEN user has no projects
- WHEN visited /projects
- THEN shows "Create your first project"

### Requirement: Loading States

Actions MUST show loading indicators.

#### Scenario: Button disabled during action

- GIVEN user clicks save
- WHEN request is pending
- THEN button shows spinner, disabled

## MODIFIED Requirements

### Requirement: Global error handler

The system MUST have a global error handler.

(Previously: No global error handler)
- NOW: sonner toasts for all errors

## REMOVED Requirements

### Requirement: (REMOVED) Silent failures

(Reason: Users must know when operations fail)