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
	['brno', 'Brno'],
	['berlin', 'Berlin'],
	['aachen', 'Aachen'],
	['cyprus', 'Cyprus'],
	['leipzig', 'Leipzig'],
	['muenchen-hmgu', 'München-HMGU'],
	['pilsen', 'Pilsen'],
	['olomouc', 'Olomouc'],
	['prague-ffm', 'Prague-FFM'],
	['prague-ior', 'Prague-IoR'],
	['mannheim', 'Mannheim'],
	['heidelberg', 'Heidelberg'],
	['rome', 'Rome-BBIRE'],
	['essen', 'Essen'],
	['goettingen', 'Göttingen'],
	['frankfurt', 'Frankfurt'],
	['dresden', 'Dresden'],
	['wuerzburg', 'Würzburg'],
	['regensburg', 'Regensburg'],
	['luebeck', 'Lübeck'],
	['augsburg', 'Augsburg'],
	['marburg', 'Marburg'],
	['goettingen', 'Göttingen'],
	['hannover', 'Hannover'],
	['muenster', 'Münster'],
	['uppsala', 'Uppsala'],
	['luebeck', 'Lübeck'],
	
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
	['sample_kind', 'sample_kind'],
];

export const backendConfig = {
	url: import.meta.env.PROD ? backendUrl : 'http://localhost:8055',
	backends: [
		'aachen',
		'berlin',
		'brno',
		'cyprus',
		'dresden',
//        'essen',
		'frankfurt',
		'goettingen',
		'heidelberg',
		'hannover',
		'luebeck',
		'muenchen-hmgu',
		'mannheim',
		'marburg',
//        'muenster',
		'olomouc',
		'regensburg',
		'pilsen',
		'prague-ffm',
		'prague-ior',
		'rome',
		'wuerzburg',
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
