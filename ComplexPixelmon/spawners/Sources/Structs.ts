import { BIOMES } from "./Data.js";

export class Pos {
    constructor(public x: number, public y: number, public z: number) {}
}

export class Spawner {
    constructor(public pos: Pos, public mons: string[], public in_cave: boolean = false) {}
}

export class Biome {
    constructor(public name: string,
                public warps: string[],
                public pos: Pos,
                public img_center_pos: Pos = new Pos(0, 0, 0),
                public spawners: Spawner[],
                public finished: boolean = true) {}

    public static get_by_name(name: string): Biome | null {
        for (const biome of BIOMES)
            if (biome.name === name)
                return biome;

        return null;
    }
}

export class Spawn {
    constructor(public biome: Biome, public spawner: Spawner, public idx: number, public slot: number, public total: number, public percent: number) {}
}