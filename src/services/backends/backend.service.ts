import type { MeasureItem, Measure, AstTopLayer, Site, MeasureGroup } from "@samply/lens";
import { Spot } from "./spot";
import { buildLibrary, buildMeasure } from "./cql-measure";
import { translateAstToCql } from "./ast-to-cql-translator";


export const requestBackend = (ast: AstTopLayer, updateResponse: (response: Map<string, Site>) => void, abortController: AbortController, measureGroups: MeasureGroup[], criteria: string[]) => {

    const measures: Measure[] = measureGroups[0].measures.map(
        (measureItem: MeasureItem) => measureItem.measure
    );

    const cql = translateAstToCql(
        ast,
        false,
        "BBMRI_STRAT_DEF_IN_INITIAL_POPULATION",
        measureGroups[0].measures,
        criteria,
    );

    const library = buildLibrary(`${cql}`);
    const measure = buildMeasure(library.url, measures);
    const query = { lang: "cql", lib: library, measure: measure };


    let backendUrl: string = ""

    if (import.meta.env.VITE_TARGET_ENVIRONMENT === "production") {
        backendUrl = "https://locator-dev.bbmri-eric.eu/backend";
    } else if (import.meta.env.VITE_TARGET_ENVIRONMENT === "staging") {
        backendUrl = "https://locator-dev.bbmri-eric.eu/backend";
    } else {
        backendUrl = "http://localhost:8055";
    }

    // const backend = new Spot(new URL(backendUrl), [
    //     "aachen",
    //     "berlin",
    //     "brno",
    //     "brno-recetox",
    //     "cyprus",
    //     "dresden",
    //     "frankfurt",
    //     "goettingen",
    //     "hannover",
    //     "heidelberg",
    //     "luebeck",
    //     "mannheim",
    //     "marburg",
    //     "muenchen-hmgu",
    //     "olomouc",
    //     "pilsen",
    //     "prague-ffm",
    //     "prague-ior",
    //     "regensburg",
    //     "rome",
    //     "wuerzburg",
    // ]);

    const backend = new Spot(new URL(backendUrl), [
        "uppsala-test",
        "eric-test",
        "prague-uhkt-test",
    ]);





    backend.send(
        btoa(decodeURI(JSON.stringify(query))),
        updateResponse,
        abortController,
    );
}
