<script lang="ts">
  import "./app.css";
  import type {
    LensOptions,
    Catalogue,
    SpotResult,
    AstTopLayer,
  } from "@samply/lens";
  import {
    setOptions,
    setCatalogue,
    markSiteClaimed,
    setSiteResult,
    clearSiteResults,
    getAst,
    querySpot,
  } from "@samply/lens";
  import { env } from "$env/dynamic/public";
  import { onMount } from "svelte";
  import { v4 as uuidv4 } from "uuid";
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

  let catalogueopen = $state(false);
  let logoutUrl = `/oauth2/sign_out?rd=${window.location.protocol}%2F%2F${window.location.hostname}%2Flogout`;

  const toggleCatalogue = () => {
    catalogueopen = !catalogueopen;
  };

  let abortController = new AbortController();
  function sendQuery(ast: AstTopLayer) {
    abortController.abort();
    abortController = new AbortController();
    clearSiteResults();

    const query = btoa(
      JSON.stringify({
        lang: "ast",
        payload: btoa(JSON.stringify({ ast, id: uuidv4() })),
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
        console.error(
          `Site ${site} failed with status ${result.status}:`,
          result.body,
        );
      }
    });
  }

  window.addEventListener("lens-search-triggered", () => {
    sendQuery(getAst());
  });

  onMount(() => {
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
    setCatalogue(catalogue as Catalogue);

    // Run empty query on initial load
    sendQuery({
      operand: "OR",
      children: [],
    });
  });
</script>

<header class="header">
  <img
    src="/search/BBMRI-ERIC-gateway-for-health.svg"
    alt="BBMRI"
    height="34px"
  />
  <menu class="menu">
    <a href="https://www.bbmri-eric.eu/about/">About Us</a>
    <a href="mailto:locator@helpdesk.bbmri-eric.eu">Contact</a>
    <a href={logoutUrl}>Logout</a>
  </menu>
</header>
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
        buttonSize="18px"
      ></lens-info-button>
    </div>
  </div>
  <div class="catalogue {catalogueopen ? 'open' : ''}">
    <!-- we are implementing our own collapsable toggle -->
    <lens-catalogue
      toggle={JSON.stringify({ collapsable: false, open: catalogueopen })}
    ></lens-catalogue>
  </div>

  <div class="charts">
    <div class="chart-wrapper result-summary">
      <lens-result-summary></lens-result-summary>
    </div>
    <div class="chart-wrapper result-table">
      <lens-result-table pageSize={50} pageSizeSwitcher={true}>
        <div slot="beneath-pagination">
          <lens-negotiate-button class="negotiate" type="Negotiator"
          ></lens-negotiate-button>
          <lens-search-modified-display>
            <div>Search has been modified!</div>
          </lens-search-modified-display>
        </div>
      </lens-result-table>
    </div>

    <div class="chart-wrapper">
      <lens-chart
        title="Gender Distribution"
        dataKey="gender"
        chartType="pie"
        displayLegends={true}
        backgroundColor={barChartBackgroundColors}
        backgroundHoverColor={barChartHoverColors}
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
      ></lens-chart>
    </div>

    <div class="chart-wrapper chart-sample-kind">
      <lens-chart
        title="Specimens"
        dataKey="sample_kind"
        chartType="bar"
        backgroundColor={barChartBackgroundColors}
        backgroundHoverColor={barChartHoverColors}
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
      ></lens-chart>
    </div>
  </div>
</main>

<error-toasts></error-toasts>

<footer class="footer">
  <div>
    <img
      src="/search/german-cancer-research-center-dkfz-logo-vector.svg"
      alt="German Cancer Research Center"
      height="40"
    />
    <img src="/search/GBN_logo.svg" alt="German Biobank Node" height="45" />
    <img src="/search/logo_ce-en-rvb-lr.jpg" alt="EU" height="50" />
  </div>
  <div>
    <a href="https://www.bbmri-eric.eu/privacy-notice/">Privacy Policy</a>
    <div>
      Made with ♥ and <a href="https://github.com/samply/lens">samply/lens</a>.
    </div>
  </div>
</footer>

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
