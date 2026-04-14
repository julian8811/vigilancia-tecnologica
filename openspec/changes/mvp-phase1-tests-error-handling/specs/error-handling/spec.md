# Delta for Error Handling

## ADDED Requirements

### Requirement: React Error Boundaries

The system MUST wrap all major routes with Error Boundary components.

#### Scenario: Component crashes shows error page

- GIVEN a component throws an error
- WHEN rendered in route
- THEN shows error UI, not white screen

#### Scenario: Error boundary resets on navigation

- GIVEN error boundary is in error state
- WHEN user navigates to another page
- THEN error boundary resets, page renders

### Requirement: TRPC Router Error Handling

All TRPC routers MUST return structured error responses.

#### Scenario: Database error returns 500

- GIVEN database query fails
- WHEN router processes request
- THEN returns {code: 'INTERNAL_SERVER_ERROR', message: '...'}

#### Scenario: Validation error returns 400

- GIVEN invalid input to router
- WHEN router processes request
- THEN returns {code: 'BAD_REQUEST', issues: [...]}

### Requirement: BullMQ Dead Letter Queue

Workers MUST implement dead letter queue for failed jobs.

#### Scenario: Failed job goes to DLQ

- GIVEN worker throws non-retryable error
- WHEN job fails 3 times
- THEN job moves to dead letter queue

#### Scenario: DLQ job can be inspected

- GIVEN job is in dead letter queue
- WHEN admin queries DLQ
- THEN returns job data and error log

### Requirement: Structured Logging

The system MUST log errors with stack traces and context.

#### Scenario: Error includes context

- GIVEN database query fails
- WHEN error is logged
- THEN includes query, params, userId, stack trace

## MODIFIED Requirements

### Requirement: Unhandled promise rejection

The system MUST NOT allow unhandled promise rejections in production.

(Previously: console.log only)
- NOW: Logs full error, sends to Sentry if available

## REMOVED Requirements

### Requirement: (REMOVED) Silent failures

(Reason: Errors must be visible to users and logged)