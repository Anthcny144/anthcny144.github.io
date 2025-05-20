var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Arrow, ArrowSide, ArrowType, ArrowSpeed } from "./Arrow.js";
export var LevelDifficulty;
(function (LevelDifficulty) {
    LevelDifficulty[LevelDifficulty["Easy"] = 0] = "Easy";
    LevelDifficulty[LevelDifficulty["Medium"] = 1] = "Medium";
    LevelDifficulty[LevelDifficulty["Hard"] = 2] = "Hard";
})(LevelDifficulty || (LevelDifficulty = {}));
export class Level {
    constructor(diff, json) {
        this.valid = false;
        this.name = "No name";
        this.author = "No author";
        this.loopDelay = false;
        this.music = "mus_x_undyne.ogg";
        this.frame = 0;
        this.length = Infinity;
        this.finish = 0;
        this.loop = false;
        this.arrows = {}; // store idx of arrows that spawn on each frame
        const hasDiff = (diff !== undefined && diff !== null);
        // handle arg inputs
        if (!hasDiff && !json)
            throw new Error("Invalid Level declaration: must either have a difficulty or a json");
        else if (diff && json)
            throw new Error("Invalid Level declaration: has both a difficulty and a json");
        // with difficulty
        if (hasDiff)
            this.diff = diff;
        // with json
        else if (json) {
            if (json.name)
                this.name = json.name;
            if (json.author)
                this.author = json.author;
            if (json.music)
                this.music = json.music;
            if (json.musicStart)
                this.musicStart = json.musicStart;
            if (json.file)
                this.file = json.file;
            if (json.loopDelay)
                this.loopDelay = json.loopDelay;
            if (json.arrows) {
                this.valid = true;
                this.json = json;
                for (const i in json.arrows) {
                    const data = json.arrows[i];
                    const frame = Math.floor(data[0]);
                    // add frame key if doesn't exist yet
                    if (!(frame in this.arrows))
                        this.arrows[frame] = [];
                    // add arrow index
                    this.arrows[frame].push(Number(i));
                    // stupid way of keeping track of the level's length
                    if (json.length === undefined)
                        this.length = frame + 1;
                }
            }
            if (json.length !== undefined)
                this.length = json.length;
        }
    }
    progress(canvas) {
        var _a;
        this.frame++;
        // go back to beginning if loop
        if (this.loop && this.frame == this.length) {
            this.frame = this.loopDelay ? 0 : 30; // 30 is the spawn frame of the first arrow of the level
        }
        // difficulty
        if (this.diff !== undefined) {
            // add a 12 frames delay if last arrow was reverse (10 is too difficult)
            const reverseDelay = ((_a = Arrow.previous) === null || _a === void 0 ? void 0 : _a.reverse) ? 12 : 0;
            // exit if arrow cooldown not reached
            if (Arrow.previous && this.frame - reverseDelay - Arrow.previous.frame < Level.spawnDiffs[this.diff])
                return;
            let spd, reverseOdds;
            const diffMult = Math.min(this.frame / Level.maxDifficulty, 1);
            switch (this.diff) {
                case LevelDifficulty.Easy:
                    reverseOdds = (diffMult * 0.05); // 0% -> 5%
                    spd = 5 + (2 * diffMult);
                    break;
                case LevelDifficulty.Medium:
                    reverseOdds = 0.15 + (diffMult * 0.15); // 15% -> 30%
                    spd = 7 + (4 * diffMult);
                    break;
                case LevelDifficulty.Hard:
                    reverseOdds = 0.25 + (diffMult * 0.25); // 25% -> 50%
                    spd = 9 + (4 * diffMult);
                    break;
            }
            const type = new ArrowType(reverseOdds);
            const side = new ArrowSide(undefined, true, type.reverse);
            const speed = new ArrowSpeed(spd);
            const arrow = new Arrow(canvas, this.frame, type, side, speed, false, 20, 60);
            Arrow.arrows.push(arrow);
        }
        // json
        else if (this.json) {
            const indeces = this.arrows[this.frame];
            if (indeces) {
                for (let i of indeces) {
                    const data = this.json.arrows[i];
                    // build arrow from json data
                    const type = new ArrowType(data[1]);
                    const side = new ArrowSide(data[2][0] === null ? undefined : data[2][0], data[2][1], type.reverse);
                    const speed = new ArrowSpeed(data[3]);
                    const fadeout = data[4];
                    const dmg = data[5];
                    const iframes = data[6];
                    const arrow = new Arrow(canvas, this.frame, type, side, speed, fadeout, dmg, iframes);
                    Arrow.arrows.push(arrow);
                }
            }
        }
    }
    static importJson() {
        return new Promise((resolve, reject) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = () => {
                if (!input.files || input.files.length == 0)
                    return;
                const file = input.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const json = JSON.parse(reader.result);
                        resolve(json);
                    }
                    catch (err) {
                        reject(new Error("Could not parse JSON: " + err));
                    }
                };
                reader.onerror = () => {
                    reject(new Error("Something unexpected occured while reading JSON"));
                };
                reader.readAsText(file);
            };
            input.click();
        });
    }
    static buildFromJson(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            // import by user input
            if (!fileName) {
                try {
                    const json = yield Level.importJson();
                    return new Level(undefined, json);
                }
                catch (error) {
                    console.error(error);
                    throw error;
                }
            }
            // import by file name
            else {
                try {
                    const res = yield fetch("/Waves/" + fileName);
                    const json = yield res.json();
                    const level = new Level(undefined, json);
                    Level.defaultWaves.push(level);
                }
                catch (e) {
                    console.error("Could not read Waves/" + fileName + ":", e);
                }
            }
        });
    }
    static loadDefaultWaves() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = [
                "geno1.json", "geno2.json", "geno3.json", "geno6.json",
                "geno7.json", "geno8.json", "geno11.json", "geno12.json",
                "geno13.json", "geno14.json"
            ];
            for (const file of files)
                yield Level.buildFromJson(file);
        });
    }
}
Level.maxDifficulty = 60 * 60 * 5; // frame when length difficulty stops increasing
Level.defaultWaves = [];
Level.spawnDiffs = {
    [LevelDifficulty.Easy]: 20,
    [LevelDifficulty.Medium]: 15,
    [LevelDifficulty.Hard]: 12
};
