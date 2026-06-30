const version = 1782824624;
const cv = await fetch(`./stats/${version}.json`).then(response => response.json());
export {version, cv};