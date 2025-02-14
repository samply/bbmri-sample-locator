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
	import { fetchData, catalogueText } from './services/catalogue.service';
	import { requestBackend } from './services/backends/backend.service';
	import type { LensDataPasser } from '@samply/lens';

	let catalogueopen = false;
	let logoutUrl = browser
		? `/oauth2/sign_out?rd=${window.location.protocol}%2F%2F${window.location.hostname}%2Flogout`
		: '';

	const toggleCatalogue = () => {
		catalogueopen = !catalogueopen;
	};

	const catalogueUrl: string = 'catalogues/catalogue-bbmri.json';
	let optionsFilePath: string = '';

	if (import.meta.env.VITE_TARGET_ENVIRONMENT === 'production') {
		optionsFilePath = 'config/options.json';
	} else {
		optionsFilePath = 'config/options-test.json';
	}

	const jsonPromises: Promise<{
		catalogueJSON: string;
		optionsJSON: string;
	}> = fetchData(catalogueUrl, optionsFilePath);

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

	let color: string = '#e95713';
	let unit: string = 'px';
	let duration: string = '1.2s';
	let size: string = '90';
	let pause: boolean = false;
	let durationUnit: string = duration.match('/[a-zA-Z]/')?.[0] ?? 's';
	let durationNum: string = '1';
	let range = (size: number, startAt = 0) =>
		[...Array(size).keys()].map((i) => i + startAt);
</script>

<header class="header">
	<img src="/search/BBMRI-ERIC-gateway-for-health.svg" alt="BBMRI" height="34px" />
	<menu class="menu">
		<a href="https://www.bbmri-eric.eu/about/">About Us</a>
		<a href="mailto:locator@helpdesk.bbmri-eric.eu">Contact</a>
		<a href="{logoutUrl}">Logout</a>
	</menu>
</header>
<div class="banner">
	<h1>BBMRI-ERIC Locator</h1>
	<h2>Search for human biospecimens across European biobanks</h2>
</div>
<main>
	<div class="search-wrapper">
		<div class="search">
			<lens-search-bar-multiple
				noMatchesFoundMessage="{"We couldn't find any matches for your search"}"
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
			src="/search/right-arrow-svgrepo-com.svg"
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
	{#await jsonPromises}
		<div class="stretch-loading-animation">
			<div
				class="wrapper"
				style="--size: {size}{unit}; --color: {color}; --duration: {duration}"
			>
				{#each range(5, 1) as version}
					<div
						class="rect"
						class:pause-animation="{pause}"
						style="animation-delay: {(version - 1) * (+durationNum / 12)}{durationUnit}"
					></div>
				{/each}
			</div>
			<p>Loading data...</p>
		</div>
	{:then { optionsJSON, catalogueJSON }}
		<lens-options {catalogueJSON} {optionsJSON} {measures}></lens-options>
		<div class="charts">
			<div class="chart-wrapper result-summary">
				<lens-result-summary></lens-result-summary>
			</div>
			<div class="chart-wrapper result-table">
				<lens-result-table pageSize="10">
					<div slot="beneath-pagination">
						<lens-negotiate-button class="negotiate" type="bbmri"></lens-negotiate-button>
						<lens-search-modified-display>
							<div>Search has been modified!</div>
						</lens-search-modified-display>
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
	{:catch someError}
		System error: {someError.message}
	{/await}
</main>

<lens-data-passer bind:this="{dataPasser}"></lens-data-passer>

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
