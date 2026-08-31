import type { LensOptions, SiteInfo } from "@samply/lens";

type DirectoryBiobankName = {
  collectionId: string;
  biobankName: string;
  countryIso?: string;
};

type DirectoryBiobankNamesResponse = {
  names?: DirectoryBiobankName[];
};

const isSiteInfo = (siteInfo: string | SiteInfo): siteInfo is SiteInfo =>
  typeof siteInfo === "object" && siteInfo !== null;

/**
 * ISO 3166-1 alpha-2 codes for European countries. Used as an allowlist so that
 * a country code is only accepted when it derives from a real European country,
 * protecting against invalid collection IDs in the configuration.
 */
const EUROPEAN_COUNTRY_CODES = new Set([
  "AD",
  "AL",
  "AT",
  "AX",
  "BA",
  "BE",
  "BG",
  "BY",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FO",
  "FR",
  "GB",
  "GG",
  "GI",
  "GR",
  "HR",
  "HU",
  "IE",
  "IM",
  "IS",
  "IT",
  "JE",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MD",
  "ME",
  "MK",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "RS",
  "RU",
  "SE",
  "SI",
  "SJ",
  "SK",
  "SM",
  "TR",
  "UA",
  "VA",
  "XK",
]);

/**
 * Derives the ISO 3166-1 alpha-2 country code from a BBMRI collection ID of the
 * form `bbmri-eric:ID:<CC>_<...>`. Returns the code only if it is a valid
 * European country code; otherwise returns `undefined`.
 */
const deriveCountryIsoFromCollectionId = (
  collectionId: string,
): string | undefined => {
  const match = /^bbmri-eric:ID:([A-Z]{2})_/.exec(collectionId);
  const country = match?.[1];
  return country && EUROPEAN_COUNTRY_CODES.has(country) ? country : undefined;
};

export const cloneLensOptions = (options: LensOptions): LensOptions => ({
  ...options,
  siteMappings: options.siteMappings
    ? Object.fromEntries(
        Object.entries(options.siteMappings).map(([site, siteInfo]) => [
          site,
          isSiteInfo(siteInfo) ? { ...siteInfo } : siteInfo,
        ]),
      )
    : undefined,
});

export const getConfiguredCollectionIds = (options: LensOptions): string[] => {
  const collectionIds = Object.values(options.siteMappings ?? {})
    .map((siteInfo) =>
      isSiteInfo(siteInfo) ? siteInfo.collectionId : undefined,
    )
    .filter((collectionId): collectionId is string => Boolean(collectionId));

  return [...new Set(collectionIds)];
};

export const mergeDirectoryBiobankNames = (
  options: LensOptions,
  directoryNames: DirectoryBiobankName[],
): LensOptions => {
  const biobankNameByCollectionId = new Map(
    directoryNames.map(({ collectionId, biobankName }) => [
      collectionId,
      biobankName,
    ]),
  );
  const siteMappings = Object.fromEntries(
    Object.entries(options.siteMappings ?? {}).map(([site, siteInfo]) => {
      const siteInfoObject = isSiteInfo(siteInfo)
        ? siteInfo
        : { displayName: siteInfo };
      const directoryName = siteInfoObject.collectionId
        ? biobankNameByCollectionId.get(siteInfoObject.collectionId)
        : undefined;

      return [
        site,
        {
          ...siteInfoObject,
          displayName: directoryName ?? siteInfoObject.displayName,
        },
      ];
    }),
  );

  return {
    ...options,
    siteMappings,
  };
};

export const getCountryIsoBySiteId = (
  options: LensOptions,
  directoryNames: DirectoryBiobankName[],
): Map<string, string> => {
  const countryIsoByCollectionId = new Map(
    directoryNames
      .filter((name): name is DirectoryBiobankName & { countryIso: string } =>
        Boolean(name.countryIso),
      )
      .map(({ collectionId, countryIso }) => [collectionId, countryIso]),
  );

  const countryIsoBySiteId = new Map<string, string>();
  for (const [site, siteInfo] of Object.entries(options.siteMappings ?? {})) {
    const collectionId = isSiteInfo(siteInfo)
      ? siteInfo.collectionId
      : undefined;
    if (!collectionId) continue;

    const directoryCountry = countryIsoByCollectionId.get(collectionId);
    if (directoryCountry) {
      countryIsoBySiteId.set(site, directoryCountry);
      continue;
    }

    const derivedCountry = deriveCountryIsoFromCollectionId(collectionId);
    if (derivedCountry) {
      console.warn(
        `Country for site "${site}" derived from collection ID "${collectionId}" (${derivedCountry}) because the BBMRI Directory lookup did not provide one.`,
      );
      countryIsoBySiteId.set(site, derivedCountry);
    }
  }

  return countryIsoBySiteId;
};

export type DirectoryBiobankNames = {
  options: LensOptions;
  countryIsoBySiteId: Map<string, string>;
};

export const loadOptionsWithDirectoryBiobankNames = async (
  options: LensOptions,
  apiUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<DirectoryBiobankNames> => {
  const collectionIds = getConfiguredCollectionIds(options);
  if (!collectionIds.length) {
    return {
      options,
      countryIsoBySiteId: getCountryIsoBySiteId(options, []),
    };
  }

  try {
    const response = await fetcher(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ collectionIds }),
    });

    if (!response.ok) {
      throw new Error(`Directory lookup failed with status ${response.status}`);
    }

    const payload = (await response.json()) as DirectoryBiobankNamesResponse;
    const directoryNames = payload.names ?? [];
    return {
      options: mergeDirectoryBiobankNames(options, directoryNames),
      countryIsoBySiteId: getCountryIsoBySiteId(options, directoryNames),
    };
  } catch (error) {
    console.warn(
      "Failed to load biobank names from the BBMRI Directory; using configured display names and collection-ID-derived country codes.",
      error,
    );
    return {
      options,
      countryIsoBySiteId: getCountryIsoBySiteId(options, []),
    };
  }
};
