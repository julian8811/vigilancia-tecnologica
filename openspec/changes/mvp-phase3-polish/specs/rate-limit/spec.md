# Delta for Rate Limiting

## ADDED Requirements

### Requirement: API Rate Limiting

The system MUST protect APIs from abuse.

#### Scenario: Search endpoint limited

- GIVEN user makes 100+ searches/minute
- WHEN 101st request
- THEN returns 429 Too Many Requests

#### Scenario: Rate limit includes reason

- GIVEN rate limited
- WHEN response
- THEN includes Retry-After header

### Requirement: Per-User Limits

The system MUST track per-user limits.

#### Scenario: Workspace limit

- GIVEN workspace makes 1000 requests/minute
- WHEN limit exceeded
- THEN workspace rate limited

## MODIFIED Requirements

### Requirement: Rate limiting

(Previously: No rate limiting)
- NOW: Implemented in TRPC middleware

## REMOVED Requirements

### Requirement: (REMOVED) Unprotected APIs

(Reason: Adding rate limiting for production)