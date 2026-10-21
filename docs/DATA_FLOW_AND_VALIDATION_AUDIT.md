Oceara MRV — Data Flow and Validation Audit

1\. Purpose

This document records the implemented project-registration data flow, validation behavior, database interactions, testing evidence, and outstanding data consistency risks in Oceara MRV.

The audit distinguishes verified implementation behavior from planned functionality and unresolved assumptions.

2\. Project Registration Data Flow



The landowner form validates the project name, location, area, and supplied coordinates using validateProjectInput().

The form parses the area using parseAreaInput() and prepares project information, including a preliminary carbon estimation.

context/DataContext.tsx converts application fields into database-style fields through appToDb().

In database mode, addProject() sends the converted project to POST /api/projects.

app/api/projects/route.ts validates the incoming name, location, area, and supplied coordinates before attempting project creation.

The API normalizes the area and prepares the project payload.

lib/database/projects.ts constructs a minimal insert row and writes the project to the projects table.

The API attempts to insert a preliminary record into estimation\_runs. If that insert fails, the current implementation logs a warning and still returns the created project.

In local-storage fallback mode, addProject() updates application state without calling the project API.



3\. Implemented Validation

Area parsing

lib/area.ts provides strict area parsing and display formatting.

The parser rejects malformed numeric strings, negative values, embedded text, unsupported units, and non-finite numeric values. Invalid numeric conversion returns zero as a fallback, while invalid display input produces an empty string.

Project input validation

lib/project-validation.ts validates:



Non-empty project name

Non-empty project location

Positive, finite project area

Latitude within -90 to 90 when coordinates are supplied

Longitude within -180 to 180 when coordinates are supplied



The POST /api/projects route invokes this validation before creating a database record and returns HTTP 400 when validation fails.

4\. Testing and Build Evidence



Area-parser tests: 13 passing.

Project-validation tests: 9 passing.

Combined unit tests: 22 passing.

TypeScript checks: passed.

Production build: successful.

git diff --check: passed for the reviewed changes.



The unit tests cover validation and parsing functions. Dedicated HTTP-level integration tests for the project API remain outstanding.

5\. Data Consistency Findings

5.1 Area representation

lib/database/schema.sql declares projects.area as TEXT NOT NULL, while application conversion functions prepare numeric values for database writes.

Status: The inconsistency in the repository is confirmed. The deployed Supabase column type has not yet been verified.

Action: Inspect the deployed schema and existing data before modifying the SQL definition or application representation.

5.2 Invalid area conversion

toNumericArea() returns zero when parsing fails. Registration validation now rejects invalid or zero area input before project creation. Other callers, particularly database update paths, require further review.

Action: Ensure invalid area values cannot silently become zero during project updates.

5.3 Estimation record handling

The project API logs a warning when insertion into estimation\_runs fails but still returns the created project.

Status: This behavior is confirmed in the implementation; whether it matches the intended system requirements is unresolved.

Action: Decide whether estimation-record creation is mandatory or optional and handle failures consistently.

5.4 Demo and database records

context/DataContext.tsx combines database-loaded projects with demo projects and marks demo entries using isDemo: true. When database loading fails, the context uses its local-storage fallback.

Action: Review how demo records are identified and ensure they are not confused with real registry records in reports or other downstream operations.

5.5 Preliminary carbon estimation

The project API records an area-based estimation methodology and labels its confidence as preliminary.

Action: Preserve the distinction between preliminary estimates, model outputs, and independently verified carbon-credit quantities.

6\. Outstanding Engineering Tasks



Verify the deployed Supabase type of projects.area.

Review the project PATCH route and database update paths for invalid-area handling.

Add HTTP-level tests for valid and invalid project-registration requests.

Define the expected failure behavior for estimation\_runs insertion.

Review demo-record identification in listings and reports.

Compare the data dictionary against the implemented API fields and actual database schema.

Re-run the relevant tests and production build after further changes.



7\. Conclusion

The current implementation includes strict area parsing, reusable project-input validation, and server-side validation before project creation. Unit tests and the production build provide evidence for these changes.

Database schema alignment, update-path validation, and API-level integration testing remain open engineering tasks. These should be verified before the implementation is described as fully consistent or production-ready.

