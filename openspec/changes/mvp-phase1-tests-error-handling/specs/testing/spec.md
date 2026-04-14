# Delta for Testing Infrastructure

## ADDED Requirements

### Requirement: Test Framework Setup

The system MUST have a vitest-based testing framework configured with react-testing-library.

#### Scenario: Tests run successfully

- GIVEN vitest is configured in package.json
- WHEN `pnpm test` is executed
- THEN all existing tests pass

#### Scenario: Coverage threshold enforced

- GIVEN coverage threshold is set to 60%
- WHEN tests are run with `--coverage`
- THEN CI fails if coverage is below threshold

### Requirement: Sources Package Tests

The system MUST have tests for all source parsers and mappers.

#### Scenario: OpenAlex mapper parses correctly

- GIVEN an OpenAlex API response
- WHEN processed by `mapOpenAlexRecord()`
- THEN returns correctly shaped NormalizedRecord

#### Scenario: Crossref mapper handles missing fields

- GIVEN a Crossref response with missing DOI
- WHEN processed by `mapCrossrefRecord()`
- THEN returns record with null DOI, does not throw

### Requirement: Query Parser Tests

The system MUST have tests for the search query parser.

#### Scenario: Simple query parses correctly

- GIVEN query "artificial intelligence"
- WHEN parsed by `parseQuery()`
- THEN returns AST with single term node

#### Scenario: Complex boolean query

- GIVEN query "(AI OR machine learning) AND patent"
- WHEN parsed by `parseQuery()`
- THEN returns AST with AND, OR nodes

### Requirement: Router Input Validation Tests

The system MUST have tests for TRPC router input validation.

#### Scenario: Valid project input passes

- GIVEN valid project create input
- WHEN processed by router
- THEN returns success

#### Scenario: Invalid email fails validation

- GIVEN project with invalid email format
- WHEN processed by router
- THEN throws ZodError

## Removed Requirements

### Requirement: (REMOVED) No testing framework

(Reason: Adding test infrastructure for production readiness)