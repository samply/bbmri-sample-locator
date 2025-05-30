/**
 * TODO: Document this file. Move to Project
 */

import type {
    AstBottomLayerValue,
    AstElement,
    AstTopLayer,
    MeasureItem,
} from "@samply/lens";
import {
    alias as aliasMap,
    cqltemplate,
    criterionMap,
} from "./cqlquery-mappings";

let codesystems: string[] = [];
let criteria: string[];

export const translateAstToCql = (
    query: AstTopLayer,
    returnOnlySingeltons: boolean = true,
    backendMeasures: string,
    measures: MeasureItem[],
    criterionList: string[],
): string => {
    criteria = criterionList;

    /**
     * DISCUSS: why is this even an array?
     * in bbmri there is only concatted to the string
     */
    codesystems = [
        // NOTE: We always need loinc, as the Deceased Stratifier is computed with it!!!
        "codesystem loinc: 'http://loinc.org'",
        "codesystem icd10: 'http://hl7.org/fhir/sid/icd-10'",
        "codesystem SampleMaterialType: 'https://fhir.bbmri.de/CodeSystem/SampleMaterialType'"
    ];

    const cqlHeader =
        "library Retrieve\n" +
        "using FHIR version '4.0.0'\n" +
        "include FHIRHelpers version '4.0.0'\n" +
        "\n";

    let singletons: string = "";
    singletons = backendMeasures + "\n";
    singletons += resolveOperation(query);

    if (query.children.length == 0) {
        singletons += "true";
    }

    if (returnOnlySingeltons) {
        return singletons;
    }

    return (
        cqlHeader +
        getCodesystems() +
        "context Patient\n" +
        measures.map((measureItem: MeasureItem) => measureItem.cql).join("") +
        "\n" +
        singletons +
        "\n"
    );
};

const resolveOperation = (operation: AstElement): string => {
    let expression: string = "";

    if ("children" in operation && operation.children.length > 1) {
        expression += "(";
    }

    if ("children" in operation) {
        operation.children.forEach((element: AstElement, index) => {
            if ("children" in element) {
                expression += resolveOperation(element);
            }
            if (
                "key" in element &&
                "type" in element &&
                "system" in element &&
                "value" in element
            ) {
                expression += getSingleton(element);
            }
            if (index < operation.children.length - 1) {
                expression +=
                    ")" + ` ${operation.operand.toLowerCase()} ` + "\n(";
            } else {
                if (operation.children.length > 1) {
                    expression += ")";
                }
            }
        });
    }

    return expression;
};

const getSingleton = (criterion: AstBottomLayerValue): string => {
    let expression: string = "";

    //TODO: Workaround for using the value of "Therapy of Tumor" as key. Need an additional field in catalogue
    if (criterion.key === "therapy_of_tumor") {
        criterion.key = criterion.value as string;
    }

    const myCriterion = criterionMap.get(criterion.key);

    if (myCriterion) {
        const myCQL = cqltemplate.get(myCriterion.type);
        if (myCQL) {
            switch (myCriterion.type) {
                case "storageTemperature":
                case "gender":
                case "BBMRI_gender":
                case "histology":
                case "conditionValue":
                case "BBMRI_conditionValue":
                case "BBMRI_conditionSampleDiagnosis":
                case "conditionSampleDiagnosis":
                case "conditionBodySite":
                case "conditionLocalization":
                case "observation":
                case "uiccstadium":
                case "observationMetastasis":
                case "observationMetastasisBodySite":
                case "procedure":
                case "procedureResidualstatus":
                case "medicationStatement":
                case "specimen":
                case "BBMRI_specimen":
                case "BBMRI_hasSpecimen":
                case "hasSpecimen":
                case "Organization":
                case "observationMolecularMarkerName":
                case "observationMolecularMarkerAminoacidchange":
                case "observationMolecularMarkerDNAchange":
                case "observationMolecularMarkerSeqRefNCBI":
                case "observationMolecularMarkerEnsemblID":
                case "department":
                case "TNMp":
                case "TNMc": {
                    if (typeof criterion.value === "string") {
                        // TODO: Check if we really need to do this or we can somehow tell cql to do that expansion it self
                        if (
                            criterion.value.slice(-1) === "%" &&
                            criterion.value.length == 5
                        ) {
                            const mykey = criterion.value.slice(0, -2);
                            if (criteria != undefined) {
                                const expandedValues = criteria.filter(
                                    (value) => value.startsWith(mykey),
                                );
                                expression += getSingleton({
                                    key: criterion.key,
                                    type: criterion.type,
                                    system: criterion.system,
                                    value: expandedValues,
                                });
                            }
                        } else if (
                            criterion.value.slice(-1) === "%" &&
                            criterion.value.length == 6
                        ) {
                            const mykey = criterion.value.slice(0, -1);
                            if (criteria != undefined) {
                                const expandedValues = criteria.filter(
                                    (value) => value.startsWith(mykey),
                                );
                                expandedValues.push(
                                    criterion.value.slice(0, 5),
                                );
                                expression += getSingleton({
                                    key: criterion.key,
                                    type: criterion.type,
                                    system: criterion.system,
                                    value: expandedValues,
                                });
                            }
                        } else {
                            expression += substituteCQLExpression(
                                criterion.key,
                                myCriterion.alias,
                                myCQL,
                                criterion.value as string,
                            );
                        }
                    }
                    if (typeof criterion.value === "boolean") {
                        expression += substituteCQLExpression(
                            criterion.key,
                            myCriterion.alias,
                            myCQL,
                        );
                    }

                    if (criterion.value instanceof Array) {
                        if (criterion.value.length === 1) {
                            expression += substituteCQLExpression(
                                criterion.key,
                                myCriterion.alias,
                                myCQL,
                                criterion.value[0],
                            );
                        } else {
                            criterion.value.forEach((value: string) => {
                                expression +=
                                    "(" +
                                    substituteCQLExpression(
                                        criterion.key,
                                        myCriterion.alias,
                                        myCQL,
                                        value,
                                    ) +
                                    ") or\n";
                            });
                            expression = expression.slice(0, -4);
                        }
                    }

                    break;
                }
                case "samplingDate":
                case "conditionRangeDate": {
                    if (!(
                        typeof criterion.value === 'object' 
                        && 'min' in criterion.value 
                        && typeof criterion.value.min === "string" 
                        && 'max' in criterion.value 
                        && typeof criterion.value.max === 'string')) break

                    /**
                     * The bbmri/gba backend needs the date in the format "@YYYY-MM-DD"
                     */
                    criterion.value.min = "@" + criterion.value.min;
                    criterion.value.max = "@" + criterion.value.max;

                    expression += substituteRangeCQLExpression(
                        criterion,
                        myCriterion,
                        "condition",
                        "Date",
                        myCQL,
                    );
                    break;
                }

                case "primaryConditionRangeDate": {
                    expression += substituteRangeCQLExpression(
                        criterion,
                        myCriterion,
                        "primaryCondition",
                        "Date",
                        myCQL,
                    );
                    break;
                }

                case "age":
                case "conditionRangeAge": {
                    expression += substituteRangeCQLExpression(
                        criterion,
                        myCriterion,
                        "condition",
                        "Age",
                        myCQL,
                    );
                    break;
                }

                case "primaryConditionRangeAge": {
                    expression += substituteRangeCQLExpression(
                        criterion,
                        myCriterion,
                        "primaryCondition",
                        "Age",
                        myCQL,
                    );
                    break;
                }
            }
        }
    }
    return expression;
};

const substituteRangeCQLExpression = (
    criterion: AstBottomLayerValue,
    myCriterion: { type: string; alias?: string[] },
    criterionPrefix: string,
    criterionSuffix: string,
    rangeCQL: string,
): string => {
    const input = criterion.value as { min: number; max: number };
    if (input === null) {
        console.warn(
            `Throwing away a ${criterionPrefix}Range${criterionSuffix} criterion, as it is not of type {min: number, max: number}!`,
        );
        return "";
    } else {
        return substituteCQLExpression(
            criterion.key,
            myCriterion.alias,
            rangeCQL,
            "",
            input.min,
            input.max,
        );
    }
};

const substituteCQLExpression = (
    key: string,
    alias: string[] | undefined,
    cql: string,
    value?: string,
    min?: number,
    max?: number,
): string => {

    let cqlString: string;
    if (value) {
        cqlString = cql.replace(/{{C}}/g, value);
    } else {
        cqlString = cql;
    }
    cqlString = cqlString.replace(new RegExp("{{K}}"), key);
    if (alias && alias[0]) {
        cqlString = cqlString.replace(new RegExp("{{A1}}", "g"), alias[0]);
        const systemExpression =
            "codesystem " + alias[0] + ": '" + aliasMap.get(alias[0]) + "'";
        if (!codesystems.includes(systemExpression)) {
            codesystems.push(systemExpression);
        }
    }
    if (alias && alias[1]) {
        cqlString = cqlString.replace(new RegExp("{{A2}}", "g"), alias[1]);
        const systemExpression =
            "codesystem " + alias[1] + ": '" + aliasMap.get(alias[1]) + "'";
        if (!codesystems.includes(systemExpression)) {
            codesystems.push(systemExpression);
        }
    }
    if (min || min === 0) {
        cqlString = cqlString.replace(new RegExp("{{D1}}"), min.toString());
    }
    if (max || max === 0) {
        cqlString = cqlString.replace(new RegExp("{{D2}}"), max.toString());
    }
    return cqlString;
};

const getCodesystems = (): string => {
    let codesystemString: string = "";

    codesystems.forEach((systems) => {
        codesystemString += systems + "\n";
    });

    if (codesystems.length > 0) {
        codesystemString += "\n";
    }

    return codesystemString;
};
