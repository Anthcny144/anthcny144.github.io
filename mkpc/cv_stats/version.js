const version = 1768496535;
const cv = await fetch(`./stats/${version}.json`).then(response => response.json());
export {version, cv};