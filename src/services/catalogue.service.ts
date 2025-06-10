/**
 * fetches the catalogue and options file from the given urls
 * @param catalogueUrl the url of the catalogue
 * @param optionsUrl the path of the options file
 * @returns a promise that resolves to an object containing the catalogue and options file as JSON strings
 */
export const fetchData = async (
	catalogueUrl: string,
	optionsUrl: string
): Promise<{ catalogueJSON: string; optionsJSON: string }> => {
	const cacheBuster = `?cb=${Date.now()}`;

	const cataloguePromise: string = await fetch(catalogueUrl + cacheBuster, { cache: 'reload' }).then((response) =>
		response.text()
	);

	const optionsPromise: string = await fetch(optionsUrl + cacheBuster, { cache: 'reload' }).then((response) =>
		response.text()
	);

	return Promise.all([cataloguePromise, optionsPromise]).then(
		([catalogueJSON, optionsJSON]) => {
			return { catalogueJSON, optionsJSON };
		}
	);
};
