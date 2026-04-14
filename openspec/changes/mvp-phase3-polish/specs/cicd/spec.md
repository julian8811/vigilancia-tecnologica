# Delta for CI/CD

## ADDED Requirements

### Requirement: GitHub Actions Pipeline

The system MUST have automated CI/CD via GitHub Actions.

#### Scenario: Tests run on PR

- GIVEN developer opens PR
- WHEN CI runs
- THEN runs tests, lint, type-check

#### Scenario: Build on main branch

- GIVEN code merges to main
- WHEN CI runs
- THEN builds all packages

#### Scenario: Deploy to staging

- GIVEN code merges to main
- WHEN CI completes
- THEN deploys to staging environment

### Requirement: Environment Configuration

The system MUST support multiple environments.

#### Scenario: Dev environment

- GIVEN running locally
- WHEN app starts
- THEN uses dev config

#### Scenario: Production environment

- GIVEN running in prod
- WHEN app starts
- THEN uses prod config

## MODIFIED Requirements

### Requirement: Deployment

(Previously: Manual deploy only)
- NOW: Automated via GitHub Actions

## REMOVED Requirements

### Requirement: (REMOVED) Manual deployment

(Reason: Replaced with CI/CD)