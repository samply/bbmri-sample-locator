

<script lang="ts">

import '../app.css';
	import type { LensDataPasser, QueryEvent } from '@samply/lens';
	import {
		barChartBackgroundColors,
		barChartHoverColors,
		genderHeaders,
		measures
	} from '../config/environment';
	import options from '../config/options.json';
	import { catalogueText, getStaticCatalogue } from '../services/catalogue.service';
	import { requestBackend } from '../services/backends/backend.service';

	let catalogueDataPromise = getStaticCatalogue(
		'/src/services/catalogues/catalogue-bbmri.json'
	);

	const toggleCatalogue = () => {
		catalogueopen = !catalogueopen;
	};

	let catalogue: HTMLElement;
	let catalogueButtonIcon: HTMLImageElement;
	let catalogueopen = false;

	let dataPasser: LensDataPasser;

	const getResponse = (): void => {
		if (!dataPasser) return;
		console.log('getResponse()', dataPasser.getResponseAPI());
	};

	window.addEventListener('emit-lens-query', (e) => {
		if (!dataPasser) return;

		setTimeout(() => {
			getResponse();
		}, 6000);

		const event = e as QueryEvent;
		const { ast, updateResponse, abortController } = event.detail;
		const criteria: string[] = dataPasser.getCriteriaAPI('diagnosis');

		requestBackend(ast, updateResponse, abortController, measures, criteria);
	});
</script>


<head>
  <meta charset='utf-8'>
  <link rel="icon" type="image/svg+xml" href="/favicon-dktk.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BBMRI-ERIC Locator</title>
</head>
<body>
  test
 




<header class="header">
	<img src="../BBMRI-ERIC-gateway-for-health.svg" alt="BBMRI" height="60px" />
	<menu class="menu">
		<a href="https://www.bbmri-eric.eu/about/">About Us</a>
		<a href="mailto:locator@helpdesk.bbmri-eric.eu">Contact</a>
		<a href="https://www.bbmri-eric.eu/bbmri-sample-and-data-portal/">Logout</a>
	</menu>
</header>
<div class="banner">
	<h1>BBMRI-ERIC Locator</h1>
	<h2>Search for human biospecimens across European biobanks</h2>
</div>
<main>
	<div class="search-wrapper">
		<div class="search">
			{#await catalogueDataPromise}
				Loading catalogue...
			{:then catalogueDataPromise}
				<lens-search-bar-multiple
					noMatchesFoundMessage="{'keine Ergebnisse gefunden'}"
					treeData="{catalogueDataPromise}"
				></lens-search-bar-multiple>
			{:catch someError}
				System error: {someError.message}.
			{/await}

			<lens-info-button
				noQueryMessage="Leere Suchanfrage: Sucht nach allen Ergebnissen."
				showQuery="{true}"
			></lens-info-button>
			<lens-search-button title="Search"></lens-search-button>
		</div>
	</div>

	<button class="catalogue-toggle-button" on:click="{toggleCatalogue}">
		<img
			bind:this="{catalogueButtonIcon}"
			src="../right-arrow-svgrepo-com.svg"
			alt="catalogue toggle button icon"
		/>
		<span>Full Parameter Search</span>
	</button>
	<div class="catalogue-info-button">
		<lens-info-button
			message="{[
				`The queries are patient-centered: The patients are selected first and then the samples of these patients`
			]}"
		></lens-info-button>
	</div>

	<div class="catalogue {catalogueopen ? 'open' : ''}" bind:this="{catalogue}">
		<lens-catalogue
			toggleIconUrl="right-arrow-svgrepo-com.svg"
			addIconUrl="long-right-arrow-svgrepo-com.svg"
			infoIconUrl="info-circle-svgrepo-com.svg"
			texts="{catalogueText}"
			toggle="{{ collapsable: false, open: catalogueopen }}"
		></lens-catalogue>
	</div>
	<div class="charts">
		<div class="chart-wrapper result-summary">
			<lens-result-summary></lens-result-summary>
		</div>
		<div class="chart-wrapper result-table">
			<lens-result-table pageSize="10">
				<div slot="beneath-pagination">
					<!-- <lens-negotiate-button /> -->
				</div>
			</lens-result-table>
		</div>

		<div class="chart-wrapper">
			<lens-chart
				title="Gender Distribution"
				catalogueGroupCode="gender"
				chartType="pie"
				displayLegends="{true}"
				headers="{genderHeaders}"
				backgroundColor="{barChartBackgroundColors}"
				backgroundHoverColor="{barChartHoverColors}"
			></lens-chart>
		</div>

		<div class="chart-wrapper chart-age-distribution">
			<lens-chart
				title="Age Distribution"
				catalogueGroupCode="age_at_diagnosis"
				chartType="bar"
				groupRange="{10}"
				filterRegex="^(1*[12]*[0-9])"
				backgroundColor="{barChartBackgroundColors}"
				backgroundHoverColor="{barChartHoverColors}"
			></lens-chart>
		</div>

		<div class="chart-wrapper chart-sample-kind">
			<lens-chart
				title="Specimens"
				catalogueGroupCode="sample_kind"
				chartType="bar"
				filterRegex="^(?!(tissue-other|buffy-coat|peripheral-blood-cells|dried-whole-blood|swab|ascites|stool-faeces|saliva|liquid-other|derivative-other))"
				backgroundColor="{barChartBackgroundColors}"
				backgroundHoverColor="{barChartHoverColors}"
			>
			</lens-chart>
		</div>

		<div class="chart-wrapper chart-diagnosis">
			<lens-chart
				title="Diagnosis"
				catalogueGroupCode="diagnosis"
				chartType="bar"
				groupingDivider="."
				groupingLabel=".%"
				filterRegex="^[CD].*"
				backgroundColor="{barChartBackgroundColors}"
				backgroundHoverColor="{barChartHoverColors}"
			></lens-chart>
		</div>
	</div>
</main>

<footer class="footer">
	<a href="https://www.bbmri-eric.eu/privacy-notice/">Privacy Policy</a>
	<div>
		Made with ♥ and <a href="https://git.verbis.dkfz.de/torbens-prototypen/lens"
			>samply/lens-core</a
		>.
	</div>
	<img
		src="../german-cancer-research-center-dkfz-logo-vector.svg"
		alt="German Cancer Research Center"
		height="40"
	/>
	<img src="../GBN_logo.svg" alt="German Biobank Node" height="60" />
	<img src="../logo_ce-en-rvb-lr.jpg" alt="EU" height="60" />
</footer>

{#await catalogueDataPromise}
	Loading catalogue...
{:then catalogueData}
	<lens-options {options} {catalogueData} {measures}></lens-options>
{:catch someError}
	System error: {someError.message}.
{/await}

<lens-data-passer bind:this="{dataPasser}"></lens-data-passer>
</body>