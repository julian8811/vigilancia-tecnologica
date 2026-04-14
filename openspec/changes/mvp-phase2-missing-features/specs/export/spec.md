# Delta for Export

## ADDED Requirements

### Requirement: CSV Export

The system MUST allow exporting search results to CSV.

#### Scenario: Export current results

- GIVEN user has 50 search results
- WHEN clicks "Export CSV"
- THEN downloads CSV with all records

#### Scenario: Export with selected fields

- GIVEN user selects title, abstract, year
- WHEN exports to CSV
- THEN CSV contains only selected columns

### Requirement: Excel Export

The system SHOULD allow exporting to Excel.

#### Scenario: Export to Excel

- GIVEN user clicks "Export Excel"
- WHEN download completes
- THEN downloads .xlsx file

### Requirement: Large Export Handling

The system MUST handle large exports gracefully.

#### Scenario: Paginated export

- GIVEN user exports 10,000 records
- WHEN export starts
- THEN shows progress, processes in batches

## MODIFIED Requirements

### Requirement: Export functionality

(Previously: No export feature)
- NOW: CSV and Excel export available

## REMOVED Requirements

### Requirement: (REMOVED) No export capability

(Reason: Adding export for user data portability)