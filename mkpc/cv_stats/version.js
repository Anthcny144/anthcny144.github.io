const version = 1742722041
const cv = await fetch(`./stats/${version}.json`).then(response => response.json());
export {version, cv};