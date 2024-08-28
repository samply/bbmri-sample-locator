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

    const backend = new Spot(new URL("http://localhost:8055"), [
        "brno",
        "berlin",
        "aachen",
        "cyprus",
        "rome",
        "muenchen-hmgu",
        "olomouc",
        "prague-ffm",
        "prague-ior",
        "mannheim",
        "heidelberg",
        "frankfurt",
        "dresden",
        "wuerzburg",
        "regensburg",
        "luebeck",
        "marburg",
        "goettingen",
        "hannover",
    ]);

    backend.send(
        btoa(decodeURI(JSON.stringify(query))),
        updateResponse,
        abortController,
    );
}
