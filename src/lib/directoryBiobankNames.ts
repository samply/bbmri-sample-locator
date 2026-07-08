import type { LensOptions, SiteInfo } from "@samply/lens";

type DirectoryBiobankName = {
  collectionId: string;
  biobankName: string;
};

type DirectoryBiobankNamesResponse = {
  names?: DirectoryBiobankName[];
};

const isSiteInfo = (siteInfo: string | SiteInfo): siteInfo is SiteInfo =>
  typeof siteInfo === "object" && siteInfo !== null;

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

export const loadOptionsWithDirectoryBiobankNames = async (
  options: LensOptions,
  apiUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<LensOptions> => {
  const collectionIds = getConfiguredCollectionIds(options);
  if (!collectionIds.length) {
    return options;
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
    return mergeDirectoryBiobankNames(options, payload.names ?? []);
  } catch (error) {
    console.warn(
      "Failed to load biobank names from the BBMRI Directory; using configured display names.",
      error,
    );
    return options;
  }
};
