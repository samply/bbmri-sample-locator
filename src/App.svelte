<script lang="ts">
	import './app.css';

	import {
		barChartBackgroundColors,
		barChartHoverColors,
		genderHeaders
	} from './config/environment';
	import type {
		LensDataPasser,
		LensOptions,
		Catalogue,
		BeamResult,
		AstTopLayer
	} from '@samply/lens';
	import {
		setOptions,
		setCatalogue,
		markSiteClaimed,
		setSiteResult,
		measureReportToSiteResult,
		clearSiteResults,
		getAst,
		createBeamTask
	} from '@samply/lens';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';

	let catalogueopen = $state(false);
	let logoutUrl = `/oauth2/sign_out?rd=${window.location.protocol}%2F%2F${window.location.hostname}%2Flogout`;

	const toggleCatalogue = () => {
		catalogueopen = !catalogueopen;
	};

	export function getBackendUrl(): string {
		let backendUrl;
		if (env.PUBLIC_ENVIRONMENT === 'test') {
			backendUrl = 'https://locator-dev.bbmri-eric.eu/backend';
		} else if (env.PUBLIC_ENVIRONMENT === 'acceptance') {
			backendUrl = 'https://locator-acc.bbmri-eric.eu/backend/';
		} else {
			// production
			backendUrl = 'https://locator.bbmri-eric.eu/backend/';
		}
		if (env.PUBLIC_BACKEND_URL) {
			backendUrl = env.PUBLIC_BACKEND_URL;
		}
		return backendUrl;
	}

	function getSiteList(): string[] {
		if (env.PUBLIC_ENVIRONMENT === 'test') {
			return ['lodz-test', 'uppsala-test', 'eric-test', 'DNB-Test'];
		} else if (env.PUBLIC_ENVIRONMENT === 'acceptance') {
			return ['eric-acc'];
		} else {
			// production
			return [
				'aachen',
				'augsburg',
				'berlin',
				'brno',
				'bonn',
				'brno-recetox',
				'cyprus',
				'dresden',
				'frankfurt',
				'goettingen',
				'hannover',
				'heidelberg',
				'hradec-kralove',
				'luebeck',
				'mannheim',
				'marburg',
				'muenchen-hmgu',
				'naples-pascale',
				'olomouc',
				'pilsen',
				'prague-ffm',
				'prague-ior',
				'prague-uhkt',
				'regensburg',
				'rome',
				'rome-opbg',
				'uppsala',
				'wuerzburg'
			];
		}
	}

	async function fetchOptions() {
		let optionsUrl;
		if (env.PUBLIC_ENVIRONMENT === 'test') {
			optionsUrl = 'config/options-test.json';
		} else if (env.PUBLIC_ENVIRONMENT === 'acceptance') {
			optionsUrl = 'config/options-acceptance.json';
		} else {
			optionsUrl = 'config/options.json'; // production
		}

		const cacheBuster = `?cb=${Date.now()}`;
		const options: LensOptions = await fetch(optionsUrl + cacheBuster).then((response) =>
			response.json()
		);
		if (options.facetCount) {
			// Get backend URL from environment variables
			options.facetCount.backendUrl = getBackendUrl().replace(/\/$/, '') + '/prism';
		}
		setOptions(options);
	}

	async function fetchCatalogue() {
		const catalogueUrl = 'catalogues/catalogue-bbmri.json';

		const cacheBuster = `?cb=${Date.now()}`;
		const catalogue: Catalogue = await fetch(catalogueUrl + cacheBuster).then(
			(response) => response.json()
		);
		setCatalogue(catalogue);
	}

	let dataPasser: LensDataPasser;

	let abortController = new AbortController();
	function sendQuery(ast: AstTopLayer) {
		abortController.abort();
		abortController = new AbortController();
		clearSiteResults();

		const query = btoa(
			JSON.stringify({
				lang: 'ast',
				payload: btoa(JSON.stringify({ ast, id: crypto.randomUUID() }))
			})
		);
		createBeamTask(
			getBackendUrl(),
			getSiteList(),
			query,
			abortController.signal,
			(result: BeamResult) => {
				const site = result.from.split('.')[1];
				if (result.status === 'claimed') {
					markSiteClaimed(site);
				} else if (result.status === 'succeeded') {
					const measureReport = JSON.parse(atob(result.body));
					setSiteResult(site, measureReportToSiteResult(measureReport));
				} else {
					console.error(`Site ${site} failed with status ${result.status}:`, result.body);
				}
			}
		);
	}

	window.addEventListener('lens-search-triggered', () => {
		sendQuery(getAst());
	});

	onMount(() => {
		fetchOptions();
		fetchCatalogue();

		// Run empty query on initial load
		sendQuery({
			operand: 'OR',
			children: []
		});
	});
</script>

<header class="header">
	<img src="/search/BBMRI-ERIC-gateway-for-health.svg" alt="BBMRI" height="34px" />
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
			<lens-query-explain-button noQueryMessage="An empty search will return all results"
			></lens-query-explain-button>
			<lens-search-button title="Search"></lens-search-button>
		</div>
	</div>

	<div class="catalogue-toggle-wrapper">
		<button class="catalogue-toggle-button" onclick={toggleCatalogue}>
			<img
				class={catalogueopen ? 'open' : ''}
				src="/search/right-arrow-svgrepo-com.svg"
				alt="catalogue toggle button icon"
			/>
			<span>Full Parameter Search</span>
		</button>
		<div class="catalogue-info-button">
			<lens-info-button
				message={[
					`The queries are patient-centered: The patients are selected first and then the samples of these patients`
				]}
				buttonSize="18px"
			></lens-info-button>
		</div>
	</div>
	<div class="catalogue {catalogueopen ? 'open' : ''}">
		<!-- we are implementing our own collapsable toggle -->
		<lens-catalogue toggle={JSON.stringify({ collapsable: false, open: catalogueopen })}
		></lens-catalogue>
	</div>

	<div class="charts">
		<div class="chart-wrapper result-summary">
			<lens-result-summary></lens-result-summary>
		</div>
		<div class="chart-wrapper result-table">
			<lens-result-table pageSize="10" pageSizeSwitcher={true}>
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
				catalogueGroupCode="gender"
				chartType="pie"
				displayLegends={true}
				headers={genderHeaders}
				backgroundColor={barChartBackgroundColors}
				backgroundHoverColor={barChartHoverColors}
			></lens-chart>
		</div>

		<div class="chart-wrapper chart-age-distribution">
			<lens-chart
				title="Age Distribution"
				catalogueGroupCode="age_at_diagnosis"
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
				catalogueGroupCode="sample_kind"
				chartType="bar"
				backgroundColor={barChartBackgroundColors}
				backgroundHoverColor={barChartHoverColors}
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
				backgroundColor={barChartBackgroundColors}
				backgroundHoverColor={barChartHoverColors}
			></lens-chart>
		</div>
	</div>
</main>

<error-toasts></error-toasts>

<lens-data-passer bind:this={dataPasser}></lens-data-passer>

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
