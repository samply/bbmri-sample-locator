# BBMRI-ERIC Locator

Production: https://locator.bbmri-eric.eu/search/  
Test: https://locator-dev.bbmri-eric.eu/search/  
Acceptance: https://locator-acc.bbmri-eric.eu/search/

## Environment variables

| Variable             | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `PUBLIC_ENVIRONMENT` | Can be either `production`, `test` or `acceptance` (default: `production`) |
| `PUBLIC_SPOT_URL`    | Overwrites the Spot URL (optional)                                         |
