# Delta for Logging

## ADDED Requirements

### Requirement: Structured Logging

The system MUST log in structured format.

#### Scenario: Error includes context

- GIVEN API request fails
- WHEN logged
- THEN JSON with level, message, stack, userId, timestamp

#### Scenario: Request logging

- GIVEN API request received
- WHEN processed
- THEN logs method, path, userId, duration

### Requirement: Log Levels

The system MUST support log levels.

#### Scenario: Production uses info+

- GIVEN running in prod
- WHEN log called
- THEN info, warn, error logged (debug not)

#### Scenario: Development shows debug

- GIVEN running in dev
- WHEN log called
- THEN all levels logged

## MODIFIED Requirements

### Requirement: Logging

(Previously: console.log scattered)
- NOW: Structured logging with levels

## REMOVED Requirements

### Requirement: (REMOVED) console.log usage

(Reason: Replaced with structured logger)