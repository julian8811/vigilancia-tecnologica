# Delta for Authentication

## ADDED Requirements

### Requirement: Password Reset

The system MUST allow users to reset their password via Clerk.

#### Scenario: User requests password reset

- GIVEN logged out user clicks "Forgot password"
- WHEN enters email and submits
- THEN receives password reset email

#### Scenario: User completes password reset

- GIVEN user clicks reset link in email
- WHEN enters new password and confirms
- THEN password is updated, user can login

### Requirement: Session Management

The system MUST handle sessions appropriately.

#### Scenario: Expired session shows login

- GIVEN user session has expired
- WHEN navigates to protected page
- THEN redirected to login

#### Scenario: Multiple tabs stay in sync

- GIVEN user has app open in multiple tabs
- WHEN user logs out in one tab
- THEN all tabs redirect to login

## MODIFIED Requirements

### Requirement: Authentication flow

(Previously: Basic sign in/out)
- NOW: Full Clerk flow with password reset capability

## REMOVED Requirements

### Requirement: (REMOVED) Hardcoded password requirements

(Reason: Clerk handles password policy)