import { type MeasureItem, type Measure, type AstTopLayer, type Site, type MeasureGroup, resolveAstSubCategories } from "@samply/lens";
import { buildLibrary, buildMeasure } from "./cql-measure";
import { translateAstToCql } from "./ast-to-cql-translator";
import { Spot } from "./spot";
import { env } from '$env/dynamic/public';
import { v4 as uuidv4 } from "uuid";

export function getBackendUrl(): string {
    let backendUrl;
    if (env.PUBLIC_ENVIRONMENT === 'test') {
        backendUrl = "https://locator-dev.bbmri-eric.eu/backend";
    } else if (env.PUBLIC_ENVIRONMENT === 'acceptance') {
        backendUrl = "https://locator-acc.bbmri-eric.eu/backend/";
    } else { // production
        backendUrl = "https://locator.bbmri-eric.eu/backend/";
    }
    if (env.PUBLIC_BACKEND_URL) {
        backendUrl = env.PUBLIC_BACKEND_URL;
    }
    return backendUrl;
}

export const requestBackend = (ast: AstTopLayer, updateResponse: (response: Map<string, Site>) => void, abortController: AbortController, measureGroups: MeasureGroup[], criteria: string[]) => {

    const measures: Measure[] = measureGroups[0].measures.map(
        (measureItem: MeasureItem) => measureItem.measure
    );

    const queryId = uuidv4();
    let query = {};

    const newAst = resolveAstSubCategories(ast)


    if (env.PUBLIC_BACKEND_FORMAT === "cql") {
        const cql = translateAstToCql(
            newAst,
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
        query = { lang: "ast", payload: btoa(decodeURI(JSON.stringify({ast: newAst, id: queryId.concat("__search__").concat(queryId) }))) };
    }


    const backendUrl = getBackendUrl();
    let siteList: string[] = [];

    if (env.PUBLIC_ENVIRONMENT === 'test') {
        siteList = [
            "lodz-test",
            "uppsala-test",
            "eric-test",
        ];
    } else if (env.PUBLIC_ENVIRONMENT === 'acceptance') {
        siteList = [
            "eric-acc"
        ];
    } else { // production
        siteList = [
            "aachen",
            "augsburg",
            "berlin",
            "brno",
            "bonn",
            "brno-recetox",
            "cyprus",
            "dresden",
            "frankfurt",
            "goettingen",
            "hannover",
            "heidelberg",
            "hradec-kralove",
            "luebeck",
            "mannheim",
            "marburg",
            "muenchen-hmgu",
            "naples-pascale",
            "olomouc",
            "pilsen",
            "prague-ffm",
            "prague-ior",
            "prague-uhkt",
            "regensburg",
            "rome",
            "rome-opbg",
            "uppsala",
            "wuerzburg",
        ];
    }

    const backend = new Spot(new URL(backendUrl), siteList, queryId);

    backend.send(
        btoa(decodeURI(JSON.stringify(query))),
        updateResponse,
        abortController,
    );
}
