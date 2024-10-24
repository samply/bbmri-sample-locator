<script lang="ts">
	import './app.css';
	import { browser } from '$app/environment';

	// conditional import for SSR
	if (browser) import('@samply/lens');

	import {
		barChartBackgroundColors,
		barChartHoverColors,
		genderHeaders,
		measures
	} from './config/environment';
	import options from './config/options.json';
	import { catalogueText, getStaticCatalogue } from './services/catalogue.service';
	import { requestBackend } from './services/backends/backend.service';
	import type { LensDataPasser } from '@samply/lens';
	import { onMount } from 'svelte';

	let catalogueDataPromise: Promise<unknown>;

	onMount(async () => {
		catalogueDataPromise = getStaticCatalogue('/catalogues/catalogue-bbmri.json');
	});

	let catalogueopen = false;

	const toggleCatalogue = () => {
		catalogueopen = !catalogueopen;
	};

	let dataPasser: LensDataPasser;

	if (browser) {
		window.addEventListener('emit-lens-query', (e) => {
			if (!dataPasser) return;

			const event = e as CustomEvent;
			const { ast, updateResponse, abortController } = event.detail;
			const criteria: string[] = dataPasser.getCriteriaAPI('diagnosis');

			requestBackend(ast, updateResponse, abortController, measures, criteria);
		});
	}
</script>

<header class="header">
	<img src="../BBMRI-ERIC-gateway-for-health.svg" alt="BBMRI" height="60px" />
	<menu class="menu">
		<a href="https://www.bbmri-eric.eu/about/">About Us</a>
		<a href="mailto:locator@helpdesk.bbmri-eric.eu">Contact</a>
		<a href="/oauth2/sign_out?rd=https://login.bbmri-eric.eu/oidc/endsession">Logout</a>
	</menu>
</header>
<div class="banner">
	<h1>BBMRI-ERIC Locator</h1>
	<h2>Search for human biospecimens across European biobanks</h2>
</div>
<main>
	<div class="search-wrapper">
		<div class="search">
			<lens-search-bar-multiple noMatchesFoundMessage="{'keine Ergebnisse gefunden'}"
			></lens-search-bar-multiple>
			<lens-info-button
				noQueryMessage="An empty search will return all results"
				showQuery="true"
			></lens-info-button>
			<lens-search-button title="Search"></lens-search-button>
		</div>
	</div>

	<button class="catalogue-toggle-button" on:click="{toggleCatalogue}">
		<img
			class="{catalogueopen ? 'open' : ''}"
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
	<div class="catalogue {catalogueopen ? 'open' : ''}">
		<lens-catalogue
			toggleIconUrl="right-arrow-svgrepo-com.svg"
			addIconUrl="long-right-arrow-svgrepo-com.svg"
			infoIconUrl="info-circle-svgrepo-com.svg"
			texts="{JSON.stringify(catalogueText)}"
			toggle="{JSON.stringify({ collapsable: false, open: catalogueopen })}"
		></lens-catalogue>
	</div>
	<div class="charts">
		<div class="chart-wrapper result-summary">
			<lens-result-summary></lens-result-summary>
		</div>
		<div class="chart-wrapper result-table">
			<lens-result-table pageSize="10">
				<div slot="beneath-pagination">
					<button class="negotiate">Negotiate with Biobanks</button>
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
				backgroundColor="{barChartBackgroundColors}"
				backgroundHoverColor="{barChartHoverColors}"
			></lens-chart>
		</div>
	</div>
</main>

<footer class="footer">
	<a href="https://www.bbmri-eric.eu/privacy-notice/">Privacy Policy</a>
	<div>
		Made with ♥ and <a href="https://github.com/samply/lens">samply/lens</a>.
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

<style>
	.negotiate {
		margin-bottom: var(--gap-l);
		padding: var(--gap-xs) var(--gap-s);
		background-color: var(--blue);
		color: var(--white);
		border: none;
		border-radius: var(--border-radius-small);
		cursor: pointer;
		font-size: var(--font-size-m);
		position: relative;
	}
	.negotiate:hover {
		background-color: var(--light-blue);
	}
</style>
