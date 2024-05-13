// VITE_TARGET_ENVIRONMENT should be set by the ci pipeline

import {
	patientsMeasureBbmriProd,
	specimenMeasureBbmriProd,
	diagnosisMeasureBbmriProd
} from '../measures';

const backendUrl =
	import.meta.env.VITE_TARGET_ENVIRONMENT === 'production'
		? 'https://backend.data.dktk.dkfz.de/prod/'
		: 'https://backend.demo.lens.samply.de/prod/';

const uiSiteMap: string[][] = [
	['berlin', 'Berlin'],
	['berlin-test', 'Berlin'],
	['bonn', 'Bonn'],
	['dresden', 'Dresden'],
	['essen', 'Essen'],
	['frankfurt', 'Frankfurt'],
	['freiburg', 'Freiburg'],
	['hannover', 'Hannover'],
	['mainz', 'Mainz'],
	['muenchen-lmu', 'München(LMU)'],
	['muenchen-tum', 'München(TUM)'],
	['ulm', 'Ulm'],
	['wuerzburg', 'Würzburg'],
	['mannheim', 'Mannheim'],
	['dktk-test', 'DKTK-Test'],
	['hamburg', 'Hamburg']
];

export const genderHeaders: Map<string, string> = new Map<string, string>()
	.set('male', 'männlich')
	.set('female', 'weiblich')
	.set('other', 'Divers, Intersexuell')
	.set('unknown', 'unbekannt');

const catalogueKeyToResponseKeyMap = [
	['gender', 'Gender'],
	['age_at_diagnosis', 'Age'],
	['diagnosis', 'diagnosis'],
	['medicationStatements', 'MedicationType'],
	['sample_kind', 'sample_kind'],
	['therapy_of_tumor', 'ProcedureType'],
	['75186-7', '75186-7']
	// ["encounter", "Encounter"],
];

export const backendConfig = {
	url: import.meta.env.PROD ? backendUrl : 'http://localhost:8055',
	backends: [
		'mannheim',
		'freiburg',
		'muenchen-tum',
		'hamburg',
		'frankfurt',
		'berlin-test',
		'dresden',
		'mainz',
		'muenchen-lmu',
		'essen',
		'ulm',
		'wuerzburg',
		'hannover'
	],
	uiSiteMap: uiSiteMap,
	catalogueKeyToResponseKeyMap: catalogueKeyToResponseKeyMap
};

export const barChartBackgroundColors: string[] = [
	'#003674',
	'#1a4a82',
	'#335e90',
	'#4d729e',
	'#6686ac',
	'#809bba',
	'#99afc7'
];

export const barChartHoverColors: string[] = [
	'#e95713'
]

export const measures = [
	patientsMeasureBbmriProd,
	specimenMeasureBbmriProd,
	diagnosisMeasureBbmriProd
];

export const backendMeasures = `BBMRI_STRAT_DEF_IN_INITIAL_POPULATION`;
