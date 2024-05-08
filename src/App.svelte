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
	let catalogueDataPromise = getStaticCatalogue('catalogues/catalogue-example.json');
</script>

<header>
	<div>
		<!-- Add logo here -->
	</div>
	<h1>Lens2 Example (Title Here)</h1>
	<div>
		<!-- Add logo here -->
	</div>
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
			<div class="chart-wrapper chart-diagnosis">
				<lens-chart
					title="Diagnose"
					catalogueGroupCode="diagnosis"
					chartType="bar"
					indexAxis="y"
					groupingDivider="."
					groupingLabel=".%"
					filterRegex="^[CD].*"
					xAxisTitle="Anzahl der Diagnosen"
					yAxisTitle="ICD-10-Codes"
					backgroundColor="{JSON.stringify(barChartBackgroundColors)}"
				></lens-chart>
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
		</div>
	</div>
</main>

<footer>
	<div class="made_with">
		Made with ♥ and <a href="https://github.com/samply/lens">samply/lens-core</a>
	</div>
	<div class="logo">
		<img src="../Deutsches_Krebsforschungszentrum_Logo.svg" alt="Logo des DKFZ" />
	</div>
</footer>

{#await catalogueDataPromise}
	Loading catalogue...
{:then catalogueData}
	<lens-options options="{libraryOptions}" {catalogueData}></lens-options>
{:catch someError}
	System error: {someError.message}.
{/await}
