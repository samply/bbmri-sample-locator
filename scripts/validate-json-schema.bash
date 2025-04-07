set -e # Return non-zero exit status if one of the validations fails
npx ajv validate -c ajv-formats -s node_modules/@samply/lens/schema/options.schema.json -d static/options.json
npx ajv validate -c ajv-formats -s node_modules/@samply/lens/schema/options.schema.json -d static/options-test.json
npx ajv validate -c ajv-formats -s node_modules/@samply/lens/schema/options.schema.json -d static/options-acceptance.json
npx ajv validate -c ajv-formats -s node_modules/@samply/lens/schema/catalogue.schema.json -d static/catalogues/catalogue-bbmri.json
