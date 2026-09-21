<script lang="ts">
  import "./app.css";
  import type { LensOptions, Catalogue, SpotResult } from "@samply/lens";
  import {
    setOptions,
    setCatalogue,
    markSiteClaimed,
    setSiteResult,
    clearSiteResults,
    getAst,
    querySpot,
    removeFailedSite,
  } from "@samply/lens";
  import { base } from "$app/paths";
  import { env } from "$env/dynamic/public";
  import { onMount, tick } from "svelte";
  import { v4 as uuidv4 } from "uuid";
  import {
    cloneLensOptions,
    loadOptionsWithDirectoryBiobankNames,
  } from "$lib/directoryBiobankNames";
  import optionsProd from "./config/options.json";
  import optionsTest from "./config/options-test.json";
  import optionsAcceptance from "./config/options-acceptance.json";
  import catalogue from "./config/catalogue-bbmri.json";

  const barChartBackgroundColors: string[] = [
    "#052c65",
    "#073d8b",
    "#094db1",
    "#0b5ed7",
    "#0d6efd",
    "#3b8afd",
    "#69a5fe",
    "#97c1fe",
    "#c5dcff",
  ];

  const barChartHoverColors: string[] = ["#E95713"];

  const diagnosisLimit = 20;

  let catalogueopen = $state(false);
  let showDiagnosisDialog = $state(false);
  let diagnosisDialog = $state<HTMLDialogElement>();
  let allDiagnosesChart = $state<HTMLElement>();
  let diagnosisDialogOpening = false;
  let stopDiagnosisSortObservation: (() => void) | undefined;

  const toggleCatalogue = () => {
    catalogueopen = !catalogueopen;
  };

  let abortController = new AbortController();

  let countryIsoByCollectionId: Map<string, string> | undefined;

  let collectionBaseUrl = "";

  const flagBaseUrl = "https://flagcdn.com/w40/";

  function sendQuery() {
    abortController.abort();
    abortController = new AbortController();
    clearSiteResults();

    /** Helper function to base64 encode a UTF-8 string */
    const base64Encode = (utf8String: string) =>
      btoa(String.fromCharCode(...new TextEncoder().encode(utf8String)));

    const query = base64Encode(
      JSON.stringify({
        lang: "ast",
        payload: base64Encode(JSON.stringify({ ast: getAst(), id: uuidv4() })),
      }),
    );
    querySpot(query, abortController.signal, (result: SpotResult) => {
      const site = result.from.split(".")[1];
      if (result.status === "claimed") {
        markSiteClaimed(site);
      } else if (result.status === "succeeded") {
        const siteResult = JSON.parse(atob(result.body));
        setSiteResult(site, siteResult);
      } else {
        removeFailedSite(site);
        console.error(
          `Site ${site} failed with status ${result.status}:`,
          result.body,
        );
      }
    });
  }

  window.addEventListener("lens-search-triggered", () => {
    sendQuery();
    scrollToResults();
  });

  const setupResultTableNameTooltips = () => {
    let animationFrameId: number | undefined;
    let tableObserver: MutationObserver | undefined;

    const updateTooltips = (resultTable: HTMLElement) => {
      const rows = resultTable.shadowRoot?.querySelectorAll<HTMLElement>(
        '[part~="lens-result-table-item-body-row"]',
      );

      rows?.forEach((row) => {
        const cells = row.querySelectorAll<HTMLElement>(
          '[part~="lens-result-table-item-body-cell"]',
        );
        const siteCell = cells[1];
        const siteName = siteCell?.textContent?.replace(/\s+/g, " ").trim();

        if (!siteCell || !siteName) {
          return;
        }

        siteCell.part.add("lens-result-table-item-body-cell-site");

        siteCell.title = siteName;
        const link = siteCell.querySelector<HTMLElement>(
          '[part~="lens-result-table-item-body-cell-link"]',
        );
        link?.setAttribute("title", siteName);
        link?.querySelectorAll<SVGElement>("svg.size-4").forEach((svg) => {
          svg.style.display = "none";
        });

        if (link && !link.querySelector(".lens-site-flag")) {
          const collectionId = link
            .getAttribute("href")
            ?.replace(collectionBaseUrl, "");
          const countryIso = collectionId
            ? countryIsoByCollectionId?.get(collectionId)
            : undefined;

          if (countryIso) {
            const flag = document.createElement("img");
            flag.src = `${flagBaseUrl}${countryIso.toLowerCase()}.png`;
            flag.alt = "";
            flag.className = "lens-site-flag";
            Object.assign(flag.style, {
              width: "18px",
              height: "12px",
              verticalAlign: "0px",
              marginRight: "4px",
              display: "inline",
            });
            link.insertBefore(flag, link.firstChild);
          }
        }
      });
    };

    const observeResultTable = () => {
      const resultTable =
        document.querySelector<HTMLElement>("lens-result-table");

      if (!resultTable?.shadowRoot) {
        animationFrameId = window.requestAnimationFrame(observeResultTable);
        return;
      }

      updateTooltips(resultTable);
      tableObserver = new MutationObserver(() => updateTooltips(resultTable));
      tableObserver.observe(resultTable.shadowRoot, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    };

    observeResultTable();

    return () => {
      tableObserver?.disconnect();
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  };

  const observeDiagnosisSort = () => {
    const chartRoot = allDiagnosesChart?.shadowRoot;
    if (!chartRoot) {
      return () => {};
    }

    let observer: MutationObserver | undefined;
    let timeoutId: number | undefined;

    const stop = () => {
      observer?.disconnect();
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };

    const selectValueDescending = () => {
      const valueSortButton = chartRoot.querySelector<HTMLButtonElement>(
        'button[aria-label^="Sort by value"]',
      );

      if (!valueSortButton) {
        return;
      }

      const sortState = valueSortButton.getAttribute("aria-label") ?? "";
      if (sortState.includes("descending")) {
        stop();
        return;
      }

      valueSortButton.click();
    };

    observer = new MutationObserver(selectValueDescending);
    observer.observe(chartRoot, {
      attributes: true,
      attributeFilter: ["aria-label"],
      childList: true,
      subtree: true,
    });
    timeoutId = window.setTimeout(stop, 1000);
    selectValueDescending();

    return stop;
  };

  const closeDiagnosisDialog = () => {
    stopDiagnosisSortObservation?.();
    stopDiagnosisSortObservation = undefined;
    diagnosisDialogOpening = false;
    showDiagnosisDialog = false;
  };

  const openDiagnosisDialog = async () => {
    if (diagnosisDialogOpening || diagnosisDialog?.open) {
      return;
    }

    diagnosisDialogOpening = true;
    try {
      showDiagnosisDialog = true;
      await tick();

      if (!diagnosisDialog?.open) {
        diagnosisDialog?.showModal();
      }

      stopDiagnosisSortObservation?.();
      stopDiagnosisSortObservation = observeDiagnosisSort();
    } finally {
      diagnosisDialogOpening = false;
    }
  };

  const initializeLens = async () => {
    // Set the options based on the environment
    let optionsSource: LensOptions = optionsProd;
    if (env.PUBLIC_ENVIRONMENT === "test") {
      optionsSource = optionsTest;
    } else if (env.PUBLIC_ENVIRONMENT === "acceptance") {
      optionsSource = optionsAcceptance;
    }

    let options = cloneLensOptions(optionsSource);

    if (env.PUBLIC_SPOT_URL) {
      options = {
        ...options,
        spotUrl: env.PUBLIC_SPOT_URL,
      };
    }

    // Check if prism URL parameter is set
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("prism")) {
      // Add facetCount option from options-test.json
      options = {
        ...options,
        facetCount: {
          hoverText: {
            gender: "Matching patients for this criterion only",
            diagnosis: "Total number of this diagnosis across all patients",
            sample_kind: "Matching samples for this criterion only",
          },
        },
      };
    }

    const {
      options: directoryOptions,
      countryIsoByCollectionId: directoryCountryIsoByCollectionId,
    } = await loadOptionsWithDirectoryBiobankNames(
      options,
      `${base}/api/directory-biobank-names`,
    );

    options = directoryOptions;

    collectionBaseUrl = options.collectionBaseUrl ?? "";
    countryIsoByCollectionId = directoryCountryIsoByCollectionId;

    setOptions(options);

    // Set the catalogue
    setCatalogue(catalogue as Catalogue);

    // Wait for the search bar to initialize (load query from URL) before sending the initial query.
    // Using setTimeout to ensure the custom element's onMount has completed.
    setTimeout(() => sendQuery(), 0);
  };

  onMount(() => {
    const cleanupResultTableNameTooltips = setupResultTableNameTooltips();
    void initializeLens();

    return () => {
      cleanupResultTableNameTooltips();
      stopDiagnosisSortObservation?.();
    };
  });

  let results: HTMLElement;

  function scrollToResults() {
    results.scrollIntoView({ behavior: "smooth" });
  }
</script>

<div class="banner">
  <h1>BBMRI-ERIC Locator</h1>
  <h2>Search for human biospecimens across European biobanks</h2>
</div>
<main>
  <div class="search-wrapper">
    <div class="search">
      <div class="search-bar-wrapper">
        <lens-search-bar-multiple
          noMatchesFoundMessage="We couldn't find any matches for your search"
        ></lens-search-bar-multiple>
      </div>
      <lens-query-explain-button
        noQueryMessage="An empty search will return all results"
      ></lens-query-explain-button>
      <lens-search-button title="Search"></lens-search-button>
    </div>
  </div>

  <div class="catalogue-toggle-wrapper">
    <button class="catalogue-toggle-button" onclick={toggleCatalogue}>
      <img
        class={catalogueopen ? "open" : ""}
        src="/search/right-arrow-svgrepo-com.svg"
        alt="catalogue toggle button icon"
      />
      <span>Full Parameter Search</span>
    </button>
    <div class="catalogue-info-button">
      <lens-info-button
        message={[
          `The queries are patient-centered: The patients are selected first and then the samples of these patients`,
        ]}
        buttonSize={18}
      ></lens-info-button>
    </div>
  </div>
  <div class="catalogue {catalogueopen ? 'open' : ''}">
    <!-- we are implementing our own collapsable toggle -->
    <lens-catalogue
      toggle={JSON.stringify({ collapsable: false, open: catalogueopen })}
    ></lens-catalogue>
  </div>

  <div class="charts" bind:this={results}>
    <div class="chart-wrapper result-summary">
      <lens-result-summary></lens-result-summary>
    </div>
    <div class="chart-wrapper result-table">
      <lens-result-table
        showRoundedTo={env.PUBLIC_ENVIRONMENT !== "test" &&
        env.PUBLIC_ENVIRONMENT !== "acceptance"
          ? (value: number) =>
              value == 0
                ? "Exact value"
                : `Rounded to the nearest multiple of ${Math.pow(10, Math.ceil(Math.log10(value) / 2))}`
          : undefined}
      ></lens-result-table>
      <lens-search-modified-display></lens-search-modified-display>
      <lens-negotiate-button
        class="negotiate"
        type="Negotiator"
        title="Negotiate with biobanks"
      ></lens-negotiate-button>
    </div>

    <div class="chart-wrapper">
      <lens-chart
        title="Gender Distribution"
        dataKey="gender"
        chartType="pie"
        displayLegends={true}
        backgroundColor={barChartBackgroundColors}
        backgroundHoverColor={barChartHoverColors}
        enableSorting={false}
      ></lens-chart>
    </div>

    <div class="chart-wrapper chart-age-distribution">
      <lens-chart
        title="Age Distribution"
        dataKey="donor_age"
        chartType="bar"
        groupRange={10}
        filterRegex="^(1*[12]*[0-9])"
        backgroundColor={barChartBackgroundColors}
        backgroundHoverColor={barChartHoverColors}
        enableSorting={false}
      ></lens-chart>
    </div>

    <div class="chart-wrapper chart-sample-kind">
      <lens-chart
        title="Specimens"
        dataKey="sample_kind"
        chartType="bar"
        backgroundColor={barChartBackgroundColors}
        backgroundHoverColor={barChartHoverColors}
        enableSorting={false}
      >
      </lens-chart>
    </div>

    <div class="chart-wrapper chart-diagnosis">
      <lens-chart
        title="Diagnosis"
        dataKey="diagnosis"
        chartType="bar"
        groupingDivider="."
        groupingLabel=".%"
        backgroundColor={barChartBackgroundColors}
        backgroundHoverColor={barChartHoverColors}
        enableSorting={false}
        topN={diagnosisLimit}
      >
        <button
          class="diagnosis-chart-toggle"
          type="button"
          aria-haspopup="dialog"
          aria-controls="diagnosis-chart-dialog"
          onclick={openDiagnosisDialog}
        >
          View all diagnoses
        </button>
      </lens-chart>
    </div>
  </div>

  {#if showDiagnosisDialog}
    <dialog
      bind:this={diagnosisDialog}
      id="diagnosis-chart-dialog"
      class="diagnosis-chart-dialog"
      aria-label="All diagnoses chart"
      onclose={closeDiagnosisDialog}
    >
      <div class="diagnosis-chart-dialog-content">
        <form method="dialog" class="diagnosis-chart-dialog-actions">
          <button type="submit" class="diagnosis-chart-dialog-close">
            Close
          </button>
        </form>

        <lens-chart
          bind:this={allDiagnosesChart}
          title="All Diagnoses"
          dataKey="diagnosis"
          chartType="bar"
          groupingDivider="."
          groupingLabel=".%"
          backgroundColor={barChartBackgroundColors}
          backgroundHoverColor={barChartHoverColors}
          enableSorting={true}
        ></lens-chart>
      </div>
    </dialog>
  {/if}
</main>

<lens-toast></lens-toast>

<style>
  .catalogue-toggle-wrapper {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    margin-bottom: var(--gap-s);
  }

  .search {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
  }

  .search-bar-wrapper {
    flex-grow: 1;
  }
</style>
