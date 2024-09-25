// This file includes a function to get the catalogue

// Use this function to get the catalogue from this project
export async function getStaticCatalogue(path: string): Promise<unknown> {
    const response = await fetch(path);
    const data = await response.json();
    return data;
}

export const catalogueText = {
    group: 'Group',
    collapseButtonTitle: 'Collapse Tree',
    expandButtonTitle: 'Expand Tree',
    numberInput: {
        labelFrom: 'from',
        labelTo: 'to'
    }
};
