const version = 1735168307
const cv = await fetch(`./stats/${version}.json`).then(response => response.json());
export {version, cv};