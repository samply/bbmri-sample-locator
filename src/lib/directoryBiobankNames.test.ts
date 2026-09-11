import { describe, expect, it } from "vitest";
import type { LensOptions } from "@samply/lens";
import {
  getConfiguredCollectionIds,
  getCountryIsoByCollectionId,
  mergeDirectoryBiobankNames,
} from "./directoryBiobankNames";

describe("directory biobank names", () => {
  const options: LensOptions = {
    siteMappings: {
      aachen: {
        displayName: "Aachen",
        collectionId: "bbmri-eric:ID:DE_RWTHCBMB:collection:RWTHCBMB_BC",
      },
      test: "Configured fallback",
    },
  };

  const aachenCollectionId = "bbmri-eric:ID:DE_RWTHCBMB:collection:RWTHCBMB_BC";

  it("gets configured collection ids from structured site mappings", () => {
    expect(getConfiguredCollectionIds(options)).toEqual([
      "bbmri-eric:ID:DE_RWTHCBMB:collection:RWTHCBMB_BC",
    ]);
  });

  it("replaces configured display names with Directory biobank names", () => {
    expect(
      mergeDirectoryBiobankNames(options, [
        {
          collectionId: "bbmri-eric:ID:DE_RWTHCBMB:collection:RWTHCBMB_BC",
          biobankName:
            "Zentralisierte Biomaterialbank der RWTH Aachen University",
        },
      ]).siteMappings,
    ).toEqual({
      aachen: {
        displayName:
          "Zentralisierte Biomaterialbank der RWTH Aachen University",
        collectionId: "bbmri-eric:ID:DE_RWTHCBMB:collection:RWTHCBMB_BC",
      },
      test: {
        displayName: "Configured fallback",
      },
    });
  });

  it("returns country ISO codes keyed by collection id from the Directory", () => {
    expect(
      getCountryIsoByCollectionId(options, [
        {
          collectionId: aachenCollectionId,
          biobankName:
            "Zentralisierte Biomaterialbank der RWTH Aachen University",
          countryIso: "DE",
        },
        {
          collectionId: "unmapped-collection",
          biobankName: "Some biobank",
          countryIso: "FR",
        },
      ]),
    ).toEqual(new Map([[aachenCollectionId, "DE"]]));
  });

  it("falls back to the country derived from the collection ID when the Directory provides none", () => {
    expect(getCountryIsoByCollectionId(options, [])).toEqual(
      new Map([[aachenCollectionId, "DE"]]),
    );
  });

  it("prefers the Directory country over the collection-ID-derived country", () => {
    expect(
      getCountryIsoByCollectionId(options, [
        {
          collectionId: aachenCollectionId,
          biobankName: "Some biobank",
          countryIso: "FR",
        },
      ]),
    ).toEqual(new Map([[aachenCollectionId, "FR"]]));
  });

  it("falls back to the derived country when the Directory returns a non-ISO country name", () => {
    expect(
      getCountryIsoByCollectionId(options, [
        {
          collectionId: aachenCollectionId,
          biobankName: "Some biobank",
          countryIso: "Germany",
        },
      ]),
    ).toEqual(new Map([[aachenCollectionId, "DE"]]));
  });

  it("normalizes lowercase Directory country codes", () => {
    expect(
      getCountryIsoByCollectionId(options, [
        {
          collectionId: aachenCollectionId,
          biobankName: "Some biobank",
          countryIso: "de",
        },
      ]),
    ).toEqual(new Map([[aachenCollectionId, "DE"]]));
  });

  it("skips sites whose collection ID is missing or yields a non-European country", () => {
    const optionsWithInvalidIds: LensOptions = {
      siteMappings: {
        noCollectionId: { displayName: "No id" },
        nonEuropean: {
          displayName: "Non European",
          collectionId: "bbmri-eric:ID:US_Harvard:collection:XYZ",
        },
        malformed: {
          displayName: "Malformed",
          collectionId: "not-a-collection-id",
        },
      },
    };

    expect(getCountryIsoByCollectionId(optionsWithInvalidIds, [])).toEqual(
      new Map(),
    );
  });
});
