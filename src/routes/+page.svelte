<script lang="ts">
  import type { LensOptions, LensCatalogue, SpotResult } from "@samply/lens";
  import {
    setOptions,
    setCatalogue,
    markSiteClaimed,
    setSiteResult,
    clearSiteResults,
    getAst,
    querySpot,
    removeFailedSite,
    SearchBarMultiple,
    QueryExplainButton,
    SearchButton,
    InfoButton,
    Catalogue,
    ResultSummary,
    ResultTable,
    SearchModifiedDisplay,
    NegotiateButton,
    Chart,
    Toasts,
    Tooltip,
  } from "@samply/lens";
  import { env } from "$env/dynamic/public";
  import { onMount } from "svelte";
  import { v4 as uuidv4 } from "uuid";
  import optionsProd from "../config/options.json";
  import optionsTest from "../config/options-test.json";
  import optionsAcceptance from "../config/options-acceptance.json";
  import catalogue from "../config/catalogue-bbmri.json";

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

  let catalogueopen = $state(false);

  const toggleCatalogue = () => {
    catalogueopen = !catalogueopen;
  };

  let abortController = new AbortController();
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

  onMount(async () => {
    // Set the options based on the environment
    let options: LensOptions = optionsProd;
    if (env.PUBLIC_ENVIRONMENT === "test") {
      options = optionsTest;
    } else if (env.PUBLIC_ENVIRONMENT === "acceptance") {
      options = optionsAcceptance;
    }
    if (env.PUBLIC_SPOT_URL) {
      options.spotUrl = env.PUBLIC_SPOT_URL;
    }
    setOptions(options);

    // Set the catalogue
    setCatalogue(catalogue as LensCatalogue);

    // Wait for the search bar to initialize (load query from URL) before sending the initial query.
    // Using setTimeout to ensure the custom element's onMount has completed.
    setTimeout(() => sendQuery(), 0);

    window.addEventListener("lens-search-triggered", () => {
      sendQuery();
    });
  });
</script>

<div class="banner">
  <h1>BBMRI-ERIC Locator</h1>
  <h2>Search for human biospecimens across European biobanks</h2>
</div>
<main>
  <div class="search-wrapper">
    <div class="search">
      <div class="search-bar-wrapper">
        <SearchBarMultiple
          noMatchesFoundMessage="We couldn't find any matches for your search"
        />
      </div>
      <QueryExplainButton
        noQueryMessage="An empty search will return all results"
      />
      <SearchButton title="Search" />
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
      <InfoButton
        message={[
          `The queries are patient-centered: The patients are selected first and then the samples of these patients`,
        ]}
        buttonSize={18}
      />
    </div>
  </div>
  <div class="catalogue {catalogueopen ? 'open' : ''}">
    <!-- we are implementing our own collapsable toggle -->
    <Catalogue toggle={{ collapsable: false, open: catalogueopen }} />
  </div>

  <div class="charts">
    <div class="chart-wrapper result-summary">
      <ResultSummary />
    </div>
    <div class="chart-wrapper result-table">
      <ResultTable>
        {#snippet formatNumber(value: number | "claimed")}
          {#if value === "claimed"}
            Loading...
          {:else if value === 0}
            <Tooltip message="Not rounded">
              {value}
            </Tooltip>
          {:else}
            {@const roundingFactor = Math.pow(
              10,
              Math.ceil(String(value).length / 2),
            )}
            <Tooltip
              message="Rounded to the nearest {roundingFactor.toLocaleString()}"
            >
              {value}
            </Tooltip>
          {/if}
        {/snippet}
      </ResultTable>
      <SearchModifiedDisplay />
      <NegotiateButton type="Negotiator" title="Negotiate with biobanks" />
    </div>

    <div class="chart-wrapper">
      <Chart
        title="Gender Distribution"
        dataKey="gender"
        chartType="pie"
        displayLegends={true}
        backgroundColor={barChartBackgroundColors}
        hoverBackgroundColor={barChartHoverColors}
        enableSorting={false}
      />
    </div>

    <div class="chart-wrapper chart-age-distribution">
      <Chart
        title="Age Distribution"
        dataKey="donor_age"
        chartType="bar"
        groupRange={10}
        filterRegex="^(1*[12]*[0-9])"
        backgroundColor={barChartBackgroundColors}
        hoverBackgroundColor={barChartHoverColors}
        enableSorting={false}
      />
    </div>

    <div class="chart-wrapper chart-sample-kind">
      <Chart
        title="Specimens"
        dataKey="sample_kind"
        chartType="bar"
        backgroundColor={barChartBackgroundColors}
        hoverBackgroundColor={barChartHoverColors}
        enableSorting={false}
      />
    </div>
    <div class="chart-wrapper chart-diagnosis">
      <Chart
        title="Diagnosis"
        dataKey="diagnosis"
        chartType="bar"
        groupingDivider="."
        groupingLabel=".%"
        backgroundColor={barChartBackgroundColors}
        hoverBackgroundColor={barChartHoverColors}
        enableSorting={false}
      />
    </div>
  </div>
</main>

<Toasts />

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
