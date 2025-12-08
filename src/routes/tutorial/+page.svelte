<script lang="ts">
  import { asset } from "$app/paths";

  // Using hot module replacement (HMR) with custom elements (aka web
  // components) does not work because a custom element cannot be updated once
  // registered, see https://github.com/WICG/webcomponents/issues/820.
  // Therefore we do a full page reload instead of HMR.
  if (import.meta.hot) {
    import.meta.hot.on("vite:beforeUpdate", () => {
      window.location.reload();
    });
  }
</script>

<div class="banner">
  <h1>BBMRI-ERIC Locator Guide</h1>
  <h2>How to Build a Cohort and Start Negotiation</h2>
  <p class="version">Version 1.1 — 05.12.2025</p>
</div>

<main>
  <section id="video-tutorial">
    <div class="video-wrapper">
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/sXcxRYXAZQQ"
        title="BBMRI-ERIC Locator Tutorial Video"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
  </section>

  <article class="tutorial-content">
    <section id="accessing-the-locator">
      <h2>1. Accessing the Locator</h2>
      <p>
        Go to
        <strong
          ><a href="https://www.bbmri-eric.eu/bbmri-sample-and-data-portal/"
            >https://www.bbmri-eric.eu/bbmri-sample-and-data-portal/</a
          ></strong
        >
        and click on <strong>Go to Locator</strong>, then log in or register.
      </p>
      <figure>
        <img
          src={asset("/tutorial/locator-homepage.png")}
          alt="Locator homepage"
        />
        <figcaption>Screenshot: Locator homepage</figcaption>
      </figure>
    </section>

    <section id="using-the-search-bar">
      <h2>2. Using the Search Bar</h2>
      <p>
        The search bar is a good place to start with <strong
          >textual searches</strong
        >.<br />
        When you type at least <strong>3 letters</strong>, you receive a
        <strong>list of possible matches</strong>.
      </p>
      <figure>
        <img
          src={asset("/tutorial/search-bar-suggestions.png")}
          alt="Search bar suggestions"
        />
        <figcaption>Screenshot: Search bar suggestions</figcaption>
      </figure>
      <p>
        You can also browse parameters using <strong
          >Full Parameter Search</strong
        >.<br />
        (A complete list of filters is included at the end of this tutorial.)
      </p>
    </section>

    <section id="viewing-all-available-data">
      <h2>3. Viewing All Available Data</h2>
      <p>
        To get an overview of what is available in the connected biobanks, click <strong
          >Search</strong
        > without specifying any search criteria.
      </p>
      <figure>
        <img
          src={asset("/tutorial/empty-search-results-overview.png")}
          alt="Empty search results overview"
        />
        <figcaption>Screenshot: Empty search results overview</figcaption>
      </figure>
    </section>

    <section id="disease-code-searches">
      <h2>4. Disease Code Searches</h2>
      <p>
        You can search for multiple diagnoses directly from the search bar.
        Multiple diagnoses are added to the same chip, meaning results will
        match <em>any</em> of the selected diagnoses (OR logic).
      </p>
      <p>
        <strong>Wildcard searches</strong>:<br />
        For less specific searches within a category (e.g.,
        <code>C18.0 – C18.9</code>), <code>.%</code> can be added (e.g.
        <code>C18.%</code>).
      </p>
      <figure>
        <img
          src={asset("/tutorial/disease-code-search.png")}
          alt="Disease code search"
        />
        <figcaption>Screenshot: Disease code search</figcaption>
      </figure>
    </section>

    <section id="understanding-search-logic">
      <h2>5. Understanding Search Logic</h2>
      <p>
        The Locator combines search criteria using specific logic rules to help
        you build precise queries:
      </p>
      <ul>
        <li>
          <strong>Within a chip (OR logic)</strong>: When multiple values are
          selected within a single chip (e.g., multiple diagnoses in one
          search), results matching <em>any</em> of those values are returned.
        </li>
        <li>
          <strong>Between chips in one search bar (AND logic)</strong>: When you
          have multiple chips in the same search bar (e.g., diagnosis AND
          specimen type), results must match <em>all</em> of those criteria.
        </li>
        <li>
          <strong>Between multiple search bars (OR logic)</strong>: When you
          create multiple search bars, results matching <em>any</em> of those complete
          search queries are returned.
        </li>
      </ul>
      <p>
        This flexible combination allows you to construct complex queries like
        ((Diagnosis: C18.1 OR C18.4) AND Specimen type: Tissue snap frozen) OR
        (Diagnosis: C18.6).
      </p>
      <figure>
        <img
          src={asset("/tutorial/search-logic-example.png")}
          alt="Search logic example"
        />
        <figcaption>Screenshot: Search logic example</figcaption>
      </figure>
    </section>

    <section id="viewing-results">
      <h2>6. Viewing Results</h2>
      <p>
        After executing your search, you can view the aggregated results across
        all connected biobanks. The interface displays:
      </p>
      <ul>
        <li>
          <strong>Gender Distribution</strong>: Breakdown of samples by gender
        </li>
        <li>
          <strong>Specimens</strong>: Types of biological samples available
        </li>
        <li>
          <strong>Diagnosis</strong>: ICD-10 codes representing diagnoses
          (including comorbidities) of donors
        </li>
        <li><strong>Age Distribution</strong>: Age ranges of donors</li>
      </ul>
      <p>
        <strong>Note:</strong> ICD-10 codes shown in the Diagnosis chart
        represent <strong>all diagnoses</strong> of matching donors, including comorbidities.
      </p>
      <figure>
        <img
          src={asset("/tutorial/results-overview.png")}
          alt="Results overview"
        />
        <figcaption>Screenshot: Results overview</figcaption>
      </figure>
    </section>

    <section id="negotiation-process">
      <h2>7. Negotiation Process</h2>
      <p>
        In the resulting table of biobank sites that may hold the required
        biospecimens:
      </p>
      <ol>
        <li>Select (check) all biobanks you want to negotiate with.</li>
        <li>Click <strong>Negotiate with biobanks</strong>.</li>
      </ol>
      <p>
        You will then be redirected to the <strong>BBMRI-ERIC Negotiator</strong
        > with your query prefilled.
      </p>
      <figure>
        <img
          src={asset("/tutorial/table-of-biobank-sites.png")}
          alt="Table of biobank sites"
        />
        <figcaption>Screenshot: Table of biobank sites</figcaption>
      </figure>
      <p>On the Negotiator platform:</p>
      <ul>
        <li>Enter the mandatory fields.</li>
        <li>
          Submit your request to the collections identified by your Locator
          query.
        </li>
      </ul>
      <p>
        <strong>Voilà!</strong><br />
        Biobank or collection owners will receive your request and respond regarding
        availability.
      </p>
    </section>

    <section id="complete-list-of-filters">
      <h2>Complete List of Filters in BBMRI-ERIC Locator</h2>

      <h3>Filter Explanations</h3>

      <dl>
        <dt>1. Patient-centered queries</dt>
        <dd>
          <ul>
            <li>Patient FHIR resources are selected first.</li>
            <li>
              Specimen FHIR resources linked to those patients are then
              included.
            </li>
          </ul>
        </dd>

        <dt>2. Gender</dt>
        <dd>
          <ul>
            <li>
              Represents the <strong>administrative gender</strong> of the patient.
            </li>
          </ul>
        </dd>

        <dt>3. Diagnosis filter</dt>
        <dd>
          <ul>
            <li>
              Returns all specimens from patients who have at least one
              <strong>Condition</strong> or <strong>Specimen</strong> resource with
              one of the selected diagnoses.
            </li>
          </ul>
        </dd>

        <dt>4. Sample types</dt>
        <dd>
          <ul>
            <li>Only samples of the selected types are shown.</li>
          </ul>
        </dd>

        <dt>5. Storage temperatures</dt>
        <dd>
          <ul>
            <li>Only samples stored at the selected temperatures are shown.</li>
            <li>Samples missing storage-temperature data are excluded.</li>
          </ul>
        </dd>

        <dt>6. Sampling date range</dt>
        <dd>
          <ul>
            <li>
              Only samples collected within this date range are displayed.
            </li>
            <li>Samples missing date information are excluded.</li>
          </ul>
        </dd>

        <dt>7. Donor age</dt>
        <dd>
          <ul>
            <li>
              Represents the patient's <strong>age today</strong>, not their age
              at sampling.
            </li>
          </ul>
        </dd>

        <dt>8. Donor age at diagnosis</dt>
        <dd>
          <ul>
            <li>
              Calculated as: <em>date of disease onset – date of birth</em>.
            </li>
            <li>
              As a result, age stratifiers may show ages outside the selected
              range.
            </li>
          </ul>
        </dd>
      </dl>
    </section>

    <section id="authors">
      <h3>Authors</h3>
      <p>
        Zdenka Dudová<br />
        Martina Kinzl<br />
        Kurt Majcen<br />
        Radovan Tomášik<br />
        Michael Hummel<br />
        Tim Schumacher
      </p>
    </section>
  </article>
</main>

<style>
  .banner {
    margin: auto;
    max-width: fit-content;
    padding: var(--gap-l);
  }

  .banner h1 {
    margin: 0;
    font-size: var(--font-size-xxl);
    font-weight: normal;
    text-align: center;
    color: var(--orange);
  }

  .banner h2 {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: normal;
    text-align: center;
    color: var(--dark-gray);
  }

  .banner .version {
    margin-top: var(--gap-s);
    text-align: center;
    font-style: italic;
    color: var(--gray);
  }

  .tutorial-content {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--gap-l);
  }

  section {
    margin-bottom: var(--gap-xxl);
  }

  h2 {
    color: var(--blue);
    font-size: var(--font-size-xl);
    margin-top: var(--gap-xl);
    margin-bottom: var(--gap-m);
  }

  h3 {
    color: var(--dark-gray);
    font-size: var(--font-size-l);
    margin-top: var(--gap-l);
    margin-bottom: var(--gap-s);
  }

  p {
    line-height: 1.6;
    margin-bottom: var(--gap-s);
  }

  ul,
  ol {
    line-height: 1.6;
    margin-bottom: var(--gap-s);
    padding-left: var(--gap-l);
  }

  li {
    margin-bottom: var(--gap-xs);
  }

  code {
    background-color: var(--lightest-gray);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
  }

  figure {
    margin: var(--gap-m) 0;
    text-align: center;
  }

  figure img {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--light-gray);
    border-radius: var(--border-radius-small);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  figcaption {
    margin-top: var(--gap-xs);
    font-size: var(--font-size-s);
    color: var(--gray);
    font-style: italic;
  }

  dl {
    margin-bottom: var(--gap-m);
  }

  dt {
    font-weight: 600;
    color: var(--dark-gray);
    margin-top: var(--gap-s);
    margin-bottom: var(--gap-xxs);
  }

  dd {
    margin-left: 0;
    margin-bottom: var(--gap-s);
  }

  dd ul {
    margin-top: var(--gap-xxs);
    padding-left: var(--gap-m);
  }

  a {
    color: var(--light-blue);
    text-decoration: none;
  }

  a:hover {
    color: var(--orange);
    text-decoration: underline;
  }

  strong {
    font-weight: 600;
  }

  #authors p {
    line-height: 1.8;
  }

  #video-tutorial {
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }

  .video-wrapper {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
    overflow: hidden;
    max-width: 100%;
    margin: var(--gap-l) 0;
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.3);
  }

  .video-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
</style>
