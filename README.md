# BBMRI-ERIC Locator

Production: https://locator.bbmri-eric.eu/search/  
Test: https://locator-dev.bbmri-eric.eu/search/
Acceptance: https://locator-acc.bbmri-eric.eu/search/

## Environment variables

| Variable                | Description                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `PUBLIC_ENVIRONMENT`    | Can be either `production`, `acceptance` or `test` (default: `production`)                     |
| `PUBLIC_BACKEND_URL`    | Overwrites the Spot URL (optional)                                                             |
| `PUBLIC_BACKEND_FORMAT` | If set to `cql`, queries are not sent as AST but converted to CQL before they are sent to Spot |
