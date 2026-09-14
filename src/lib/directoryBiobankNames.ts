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
 * Normalizes a potential ISO 3166-1 alpha-2 country code (e.g. "de" -> "DE"),
 * returning `undefined` unless the value is exactly two letters.
 */
const toIsoCode = (value: string | undefined): string | undefined => {
  const code = value?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : undefined;
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

export const getCountryIsoByCollectionId = (
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

  const sitesWithoutDirectoryCountry: string[] = [];
  const countryIsoByConfiguredCollectionId = new Map<string, string>();

  for (const [site, siteInfo] of Object.entries(options.siteMappings ?? {})) {
    const collectionId = isSiteInfo(siteInfo)
      ? siteInfo.collectionId
      : undefined;
    if (!collectionId) continue;

    const directoryCountry = toIsoCode(
      countryIsoByCollectionId.get(collectionId),
    );
    if (directoryCountry) {
      countryIsoByConfiguredCollectionId.set(collectionId, directoryCountry);
      continue;
    }

    const derivedCountry = toIsoCode(
      /^bbmri-eric:ID:([A-Z]{2})_/.exec(collectionId)?.[1],
    );
    if (derivedCountry) {
      sitesWithoutDirectoryCountry.push(site);
      countryIsoByConfiguredCollectionId.set(collectionId, derivedCountry);
    }
  }

  if (sitesWithoutDirectoryCountry.length) {
    console.warn(
      `Country codes for site(s) ${sitesWithoutDirectoryCountry.join(
        ", ",
      )} were derived from their collection IDs because the BBMRI Directory provided no valid ISO country code.`,
    );
  }

  return countryIsoByConfiguredCollectionId;
};

export type DirectoryBiobankNames = {
  options: LensOptions;
  countryIsoByCollectionId: Map<string, string>;
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
      countryIsoByCollectionId: getCountryIsoByCollectionId(options, []),
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
      countryIsoByCollectionId: getCountryIsoByCollectionId(
        options,
        directoryNames,
      ),
    };
  } catch (error) {
    console.warn(
      "Failed to load biobank names from the BBMRI Directory; using configured display names and collection-ID-derived country codes.",
      error,
    );
    return {
      options,
      countryIsoByCollectionId: getCountryIsoByCollectionId(options, []),
    };
  }
};
