# BBMRI-ERIC Locator

Production: https://locator.bbmri-eric.eu/search/  
Test: https://locator-dev.bbmri-eric.eu/search/  
Acceptance: https://locator-acc.bbmri-eric.eu/search/

## Environment variables

| Variable                     | Description                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `PUBLIC_ENVIRONMENT`         | Can be either `production`, `test` or `acceptance` (default: `production`)                  |
| `PUBLIC_SPOT_URL`            | Overwrites the Spot URL (optional)                                                          |
| `PUBLIC_LENS_OPTIONS`        | JSON object overriding the selected environment's Lens options (optional)                   |
| `DIRECTORY_GRAPHQL_ENDPOINT` | Server-side Directory GraphQL URL (default: `https://directory.bbmri-eric.eu/ERIC/graphql`) |

These settings are read at runtime. Unset or blank `PUBLIC_LENS_OPTIONS` and
`DIRECTORY_GRAPHQL_ENDPOINT` values preserve the defaults. Lens options are
merged shallowly: supplied top-level properties, including `siteMappings` and
`negotiateOptions`, replace those properties completely. `PUBLIC_SPOT_URL` takes
precedence over a `spotUrl` supplied in `PUBLIC_LENS_OPTIONS`. Invalid JSON or a
non-object value stops Lens initialization.

`PUBLIC_LENS_OPTIONS` is visible to the browser; do not put private credentials
in it. For example, to use a local Negotiator:

```yaml
environment:
  PUBLIC_LENS_OPTIONS: '{"negotiateOptions":{"url":"http://localhost:8090/api/v3/requests","authorizationHeader":""}}'
  DIRECTORY_GRAPHQL_ENDPOINT: http://directory-fixture:8070/graphql
```
