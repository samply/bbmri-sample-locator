import type { MeasureItem, Measure, AstTopLayer, Site, MeasureGroup } from "@samply/lens";
import { buildLibrary, buildMeasure } from "./cql-measure";
import { translateAstToCql } from "./ast-to-cql-translator";
import { Spot } from "./spot";
import { env } from '$env/dynamic/public';

export const requestBackend = (ast: AstTopLayer, updateResponse: (response: Map<string, Site>) => void, abortController: AbortController, measureGroups: MeasureGroup[], criteria: string[]) => {

    const measures: Measure[] = measureGroups[0].measures.map(
        (measureItem: MeasureItem) => measureItem.measure
    );

    const queryId = crypto.randomUUID();
    let query = {};

    if (env.PUBLIC_BACKEND_FORMAT === "cql") {
        const cql = translateAstToCql(
            ast,
            false,
            "BBMRI_STRAT_DEF_IN_INITIAL_POPULATION",
            measureGroups[0].measures,
            criteria,
        );

        const library = buildLibrary(`${cql}`);
        const measure = buildMeasure(library.url, measures);
        query = { lang: "cql", lib: library, measure: measure };
    } else {
        // Fallback to AST
        query = { lang: "ast", payload: btoa(decodeURI(JSON.stringify({ast: ast, id: queryId.concat("__search__").concat(queryId) }))) };
    }


    let backendUrl: string = "";
    let siteList: string[] = [];

    if (env.PUBLIC_ENVIRONMENT === 'staging') {
        backendUrl = "https://locator-dev.bbmri-eric.eu/backend";
        siteList = [
            "uppsala-test",
            "eric-test",
            "prague-uhkt-test",
        ];
    } else { // production
        backendUrl = "https://locator.bbmri-eric.eu/backend/";
        siteList = [
            "aachen",
            "augsburg",
            "berlin",
            "brno",
            "brno-recetox",
            "cyprus",
            "dresden",
            "frankfurt",
            "goettingen",
            "hannover",
            "heidelberg",
            "luebeck",
            "mannheim",
            "marburg",
            "muenchen-hmgu",
            "naples-pascale",
            "olomouc",
            "pilsen",
            "prague-ffm",
            "prague-ior",
            "regensburg",
            "rome",
            "rome-opbg",
            "uppsala",
            "wuerzburg",
        ];
    }

    if (env.PUBLIC_BACKEND_URL) {
        backendUrl = env.PUBLIC_BACKEND_URL;
    }

    const backend = new Spot(new URL(backendUrl), siteList, queryId);

    backend.send(
        btoa(decodeURI(JSON.stringify(query))),
        updateResponse,
        abortController,
    );
}
