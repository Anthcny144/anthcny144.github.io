const version = 1738228703
const cv = await fetch(`./stats/${version}.json`).then(response => response.json());
export {version, cv};