set -e # Fail immediately if one of the validations fails
ajv validate -c ajv-formats -s node_modules/@samply/lens/packages/lib/src/types/options.schema.json -d static/config/options.json
ajv validate -c ajv-formats -s node_modules/@samply/lens/packages/lib/src/types/options.schema.json -d static/config/options-test.json
ajv validate -c ajv-formats -s node_modules/@samply/lens/packages/lib/src/types/catalogue.schema.json -d static/catalogues/catalogue-bbmri.json