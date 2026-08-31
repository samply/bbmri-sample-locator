import { json, type RequestHandler } from "@sveltejs/kit";

const DIRECTORY_GRAPHQL_ENDPOINT =
  "https://directory.bbmri-eric.eu/ERIC/graphql";
const MAX_COLLECTION_IDS = 200;

type DirectoryCollection = {
  id?: string;
  biobank?: {
    name?: string;
    country?: {
      name?: string;
    };
  };
};

type DirectoryGraphqlResponse = {
  data?: {
    Collections?: DirectoryCollection[];
  };
  errors?: { message?: string }[];
};

const query = `
  query DirectoryBiobankNames($ids: [String]) {
    Collections(filter: { id: { equals: $ids } }, limit: ${MAX_COLLECTION_IDS}) {
      id
      biobank {
        name
        country {
          name
        }
      }
    }
  }
`;

export const POST: RequestHandler = async ({ request, fetch }) => {
  const requestBody = (await request.json().catch(() => ({}))) as {
    collectionIds?: unknown;
  };
  const collectionIds = Array.isArray(requestBody.collectionIds)
    ? [
        ...new Set(
          requestBody.collectionIds.filter(
            (collectionId): collectionId is string =>
              typeof collectionId === "string" && collectionId.length > 0,
          ),
        ),
      ].slice(0, MAX_COLLECTION_IDS)
    : [];

  if (!collectionIds.length) {
    return json({ names: [] });
  }

  let response: Response;
  try {
    response = await fetch(DIRECTORY_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          ids: collectionIds,
        },
      }),
    });
  } catch (error) {
    console.error(
      "Failed to reach the BBMRI Directory GraphQL endpoint.",
      error,
    );
    return json(
      {
        message: "Failed to reach the BBMRI Directory.",
        detail:
          error instanceof Error
            ? error.message
            : "Unknown network or TLS error",
      },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return json(
      { message: "Failed to fetch biobank names from the BBMRI Directory." },
      { status: 502 },
    );
  }

  let payload: DirectoryGraphqlResponse;
  try {
    payload = (await response.json()) as DirectoryGraphqlResponse;
  } catch (error) {
    console.error(
      "Received an invalid response from the BBMRI Directory GraphQL endpoint.",
      error,
    );
    return json(
      {
        message: "The BBMRI Directory returned an invalid response.",
        detail:
          error instanceof Error ? error.message : "Response was not JSON",
      },
      { status: 502 },
    );
  }

  if (payload.errors?.length) {
    return json(
      {
        message: payload.errors
          .map((error) => error.message)
          .filter(Boolean)
          .join(". "),
      },
      { status: 502 },
    );
  }

  return json({
    names:
      payload.data?.Collections?.flatMap((collection) =>
        collection.id && collection.biobank?.name
          ? [
              {
                collectionId: collection.id,
                biobankName: collection.biobank.name,
                countryIso: collection.biobank.country?.name,
              },
            ]
          : [],
      ) ?? [],
  });
};
