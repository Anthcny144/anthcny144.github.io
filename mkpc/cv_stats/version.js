const version = 1759425668;
const cv = await fetch(`./stats/${version}.json`).then(response => response.json());
export {version, cv};