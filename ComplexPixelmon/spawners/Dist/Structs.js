import { BIOMES } from "./Data.js";
export class Pos {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
export class Spawner {
    constructor(pos, mons, in_cave = false) {
        this.pos = pos;
        this.mons = mons;
        this.in_cave = in_cave;
    }
}
export class Biome {
    constructor(name, warps, pos, img_center_pos = new Pos(0, 0, 0), spawners, finished = true) {
        this.name = name;
        this.warps = warps;
        this.pos = pos;
        this.img_center_pos = img_center_pos;
        this.spawners = spawners;
        this.finished = finished;
    }
    static get_by_name(name) {
        for (const biome of BIOMES)
            if (biome.name === name)
                return biome;
        return null;
    }
}
export class Spawn {
    constructor(biome, spawner, idx, slot, total, percent) {
        this.biome = biome;
        this.spawner = spawner;
        this.idx = idx;
        this.slot = slot;
        this.total = total;
        this.percent = percent;
    }
}
