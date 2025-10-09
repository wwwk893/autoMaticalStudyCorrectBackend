# Seed Data Scripts

Bootstrap sample tenants, teachers, classes, and assignments for local development environments.

## Files
- **`seed.sql`**
  - SQL statements that populate Postgres with baseline tenants, teachers, class rosters, and homework assignments.
- **`seed.js`**
  - Node script orchestrating execution of the SQL seed and additional API calls (e.g., presigning uploads) for richer demo data.

## Usage
- Run `make seed` after `make up` to import the seed dataset; credentials align with README quick-start instructions.
- Modify or extend the SQL file to include additional tenants or example submissions as needed for demos.
