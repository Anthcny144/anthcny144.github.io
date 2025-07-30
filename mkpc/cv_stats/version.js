const version = 1753878641
const cv = await fetch(`./stats/${version}.json`).then(response => response.json());
export {version, cv};