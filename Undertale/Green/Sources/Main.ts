import {Game} from "./Game.js";
new Game(60).run();

/*
TODO:
- level editor
- mobile controls

- score: en fait il faut qu'il soit calculé en fonction du moment où la flèche hit le joueur: si 2 flèches spawnent à la même frame, ça va diviser par 0 (spawnDiff)
  aussi essayer de prendre en compte mult si aucun move useless n'est fait (uniquement quand different side ?)
  il faudrait aussi que ça prenne le combo des cd: si 3 flèches spawnent à très peu d'interval, c'est 10000x + dur que si c'était que 2 flèches
  il faut aussi que le score soit + élevé si la flèche fonce dans le shield. Si on met shield dans flèche, ça donne - de score (une sorte d'accuracy en mode osu)

- scale buttons with grid
  faire des vars genre leftCol = this.grid, rightCol = this.grid * 5 (jsp)

- mute arrow sounds?
*/