const version = 1771608707;
const cv = await fetch(`./stats/${version}.json`).then(response => response.json());
export {version, cv};