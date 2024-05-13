<script lang="ts">
	import libraryOptions from './config/options.json';
	import {
		backendConfig,
		barChartBackgroundColors,
		genderHeaders,
		measures,
		backendMeasures
	} from './config/environment';
	import { catalogueText, getStaticCatalogue } from './services/catalogue.service';

	let catalogueopen = false;
	let catalogueDataPromise = getStaticCatalogue('catalogues/catalogue-bbmri.json');
</script>

<header class="row line">
	<img src="../BBMRI-ERIC-gateway-for-health.svg" alt="BBMRI" height="60px" />
	<menu class="menu">
		<a href="https://www.bbmri-eric.eu/about/">About Us</a>
		<a href="mailto:locator@helpdesk.bbmri-eric.eu">Contact</a>
		<a href="https://www.bbmri-eric.eu/bbmri-sample-and-data-portal/">Logout</a>
	</menu>
</header>

<main>
	<div class="search">
		{#await catalogueDataPromise}
			Loading catalogue...
		{:then catalogueData}
			<lens-search-bar-multiple
				noMatchesFoundMessage="{'keine Ergebnisse gefunden'}"
				treeData="{catalogueData}"
			></lens-search-bar-multiple>
		{:catch someError}
			System error: {someError.message}.
		{/await}

		<lens-info-button
			noQueryMessage="Leere Suchanfrage: Sucht nach allen Ergebnissen."
			showQuery="{true}"
		></lens-info-button>
		<lens-search-button title="Suchen" {measures} {backendConfig} {backendMeasures}
		></lens-search-button>
	</div>
	<div class="grid">
		<div class="catalogue">
			<h2>Suchkriterien</h2>
			<lens-info-button
				message="{[
					`Bei Patienten mit mehreren onkologischen Diagnosen, können sich ausgewählte Suchkriterien nicht nur auf eine Erkrankung beziehen, sondern auch auf Weitere.`,
					`Innerhalb einer Kategorie werden verschiedene Ausprägungen mit einer „Oder-Verknüpfung“ gesucht; bei der Suche über mehrere Kategorien mit einer „Und-Verknüpfung“.`
				]}"
			></lens-info-button>
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
				<lens-search-modified-display
					>Diagramme repräsentieren nicht mehr die aktuelle Suche!</lens-search-modified-display
				>
			</div>
			<div class="chart-wrapper result-table">
				<lens-result-table pageSize="10">
					<div slot="above-pagination" class="result-table-hint-text">
						* Umfasst Gewebe- und flüssige Proben. Die Anzahl der FFPE-Proben (Schätzung)
						entspricht der Zahl der Diagnosen.
					</div>
				</lens-result-table>
			</div>
			<div class="chart-wrapper">
				<lens-chart
					title="Geschlecht"
					catalogueGroupCode="gender"
					chartType="pie"
					displayLegends="{true}"
					headers="{genderHeaders}"
				></lens-chart>
			</div>
			<div class="chart-wrapper chart-age-distribution">
				<lens-chart
					title="Alter bei Erstdiagnose"
					catalogueGroupCode="age_at_diagnosis"
					chartType="bar"
					groupRange="{10}"
					filterRegex="^(1*[12]*[0-9])"
					xAxisTitle="Alter"
					yAxisTitle="Anzahl der Primärdiagnosen"
					backgroundColor="{JSON.stringify(barChartBackgroundColors)}"
				></lens-chart>
			</div>
			<div class="chart-wrapper">
				<lens-chart
					title="Proben"
					catalogueGroupCode="sample_kind"
					chartType="bar"
					xAxisTitle="Probentypen"
					yAxisTitle="Probenanzahl"
					filterRegex="^(?!(tissue-other|buffy-coat|peripheral-blood-cells|dried-whole-blood|swab|ascites|stool-faeces|saliva|liquid-other|derivative-other))"
					backgroundColor="{JSON.stringify(barChartBackgroundColors)}"
				>
				</lens-chart>
			</div>
			<div class="chart-wrapper">
				<lens-chart
					title="Diagnose"
					catalogueGroupCode="diagnosis"
					chartType="bar"
					indexAxis="x"
					groupingDivider="."
					groupingLabel=".%"
					filterRegex=".*"
					xAxisTitle="Anzahl der Diagnosen"
					yAxisTitle="ICD-10-Codes"
					backgroundColor="{JSON.stringify(barChartBackgroundColors)}"
				></lens-chart>
			</div>
		</div>
	</div>
</main>

<footer class="row line">
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
	<lens-options options="{libraryOptions}" {catalogueData}></lens-options>
{:catch someError}
	System error: {someError.message}.
{/await}
