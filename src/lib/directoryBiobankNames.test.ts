import { describe, expect, it } from "vitest";
import type { LensOptions } from "@samply/lens";
import {
  getConfiguredCollectionIds,
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
});
