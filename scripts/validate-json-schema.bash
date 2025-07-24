set -e # Return non-zero exit status if one of the validations fails
npx ajv validate -c ajv-formats -s node_modules/@samply/lens/schema/options.schema.json -d src/config/options.json
npx ajv validate -c ajv-formats -s node_modules/@samply/lens/schema/options.schema.json -d src/config/options-test.json
npx ajv validate -c ajv-formats -s node_modules/@samply/lens/schema/options.schema.json -d src/config/options-acceptance.json
npx ajv validate -c ajv-formats -s node_modules/@samply/lens/schema/catalogue.schema.json -d src/config/catalogue-bbmri.json
