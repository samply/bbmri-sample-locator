// VITE_TARGET_ENVIRONMENT should be set by the ci pipeline

import {
	dktkDiagnosisMeasure,
	dktkMedicationStatementsMeasure,
	dktkPatientsMeasure,
	dktkProceduresMeasure,
	dktkSpecimenMeasure,
	dktkHistologyMeasure
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

export const barChartBackgroundColors: string[] = ['#4dc9f6', '#3da4c7'];

export const measures = [
	dktkPatientsMeasure,
	dktkDiagnosisMeasure,
	dktkSpecimenMeasure,
	dktkProceduresMeasure,
	dktkMedicationStatementsMeasure,
	dktkHistologyMeasure
];

export const backendMeasures = `DKTK_STRAT_DEF_IN_INITIAL_POPULATION`;
