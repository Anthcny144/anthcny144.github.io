const version = 1735222362
const cv = await fetch(`./stats/${version}.json`).then(response => response.json());
export {version, cv};