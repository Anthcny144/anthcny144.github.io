import { BIOMES } from "./Data.js";
import { Biome, Spawn } from "./Structs.js";

class DrawData {
    canvas: HTMLCanvasElement | null = null;
    ctx: CanvasRenderingContext2D | null = null;
    img: HTMLImageElement | null = null;
    rect: Record<string, number> | null = null;
    timer: number = 0;
    size: number = 0;

    public draw() {
        if (!this.canvas || !this.ctx || !this.img || !this.rect)
            return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.img, 0, 0);
        
        this.size = 8 + this.timer;
        this.ctx.fillStyle = "rgba(255,0,0,1)";
        this.ctx.fillRect(this.rect.x - this.timer/2, this.rect.y - this.timer/2, this.size, this.size);
    }
}

let data: Record<string, Record<string, Record<number, number[]>>> = {};
let draw = new DrawData();

function get_odds_emoji(percent: number) {
    if (percent === 100)
        return "✅";

    if (percent >= 75)
        return "🟢";

    if (percent >= 50)
        return "🟡";

    if (percent >= 25)
        return "🟠";

    return "🔴";
}

/*function find_bold(text: string, input: string) {
    const pos = text.toLowerCase().indexOf(input.toLowerCase());
    const end = pos + input.length;

    if (pos === -1)
        return "?";

    const bold = `<span>${text.substring(0, pos)}<strong>${text.substring(pos, end)}</strong>${text.substring(end, text.length)}</span>`;
    return bold;
}*/

function filter() {
    // get HTML elements
    const cmbbox = document.getElementById("mons")! as HTMLSelectElement;
    const html_search = document.getElementById("search")! as HTMLInputElement;
    const html_results = document.getElementById("results")! as HTMLSelectElement;

    // filter input
    const input = html_search.value;
    const filtered = Array.from(cmbbox.options).filter(m => m.value.toLowerCase().startsWith(input));

    // add filtered to select box
    html_results.innerHTML = "";

    if (input === "")
        return;

    for (const result of filtered) {
        const opt = document.createElement("option");
        opt.value = result.value;
        opt.innerHTML = result.value; // find_bold(result.value, input);
        html_results.appendChild(opt);
    }
}

function show_mon(event: Event) {
    const select = event.target as HTMLSelectElement;
    const mon = select.value;

    // get HTML elements
    const html_map = document.getElementById("map")! as HTMLCanvasElement;
    const html_sprite = document.getElementById("sprite")! as HTMLImageElement;
    const html_name = document.getElementById("name")!;
    const html_right_div = document.getElementById("right_div")!;
    const html_bonus_info = document.getElementById("bonus_info")!;

    // remove spawns
    html_right_div.querySelectorAll("p").forEach(p => p.remove());

    // gather spawns
    let spawns: Spawn[] = [];
    for (const biome_name in data[mon]) {
        for (let spawner_idx in data[mon][biome_name]) {
            const biome = Biome.get_by_name(biome_name)!;
            const spawner = biome.spawners[spawner_idx];

            const [slot, total] = data[mon][biome_name][spawner_idx];
            const percent = Math.round((total - slot + 1) / total * 100);
            const idx = Number(spawner_idx);

            const spawn = new Spawn(biome, spawner, idx, slot, total, percent);
            spawns.push(spawn);
        }
    }

    // sort spawns
    spawns = spawns.sort((a, b) => b.percent - a.percent);

    // create p elements
    for (const spawn of spawns) {
        const spawner_info = `${get_odds_emoji(spawn.percent)} ${spawn.biome.name}: ${spawn.slot} / ${spawn.total} <strong>(${spawn.percent}%)</strong>`;        
        const html_spawner = document.createElement("p");
        html_spawner.innerHTML = spawner_info;
        
        html_spawner.addEventListener("mouseenter", () => {
            html_spawner.style.color = "lime";
            html_bonus_info.innerHTML = (`📍 XYZ:&nbsp   ${spawn.spawner.pos.x}&nbsp   /&nbsp   ${spawn.spawner.pos.y}&nbsp   /&nbsp   ${spawn.spawner.pos.z}`) +
                                          (spawn.spawner.in_cave ? "<br>🪨 This spawner is in a cave or under a roof" : "");

            const img = new Image();
            img.src = `./Assets/Biomes/${spawn.biome.name}.png`;
            img.onload = () => {
                // get position offset
                const spawner = spawn.biome.spawners[spawn.idx];
                const offset = {
                    x: spawn.biome.pos.x - spawner.pos.x,
                    y: spawn.biome.pos.z - spawner.pos.z
                };

                // draw
                html_map.width = img.width;
                html_map.height = img.height;

                const ctx = html_map.getContext("2d")!;

                draw.canvas = html_map;
                draw.ctx = ctx;
                draw.img = img;
                draw.rect = {
                    x: spawn.biome.img_center_pos.x - offset.x - 1,
                    y: spawn.biome.img_center_pos.z - offset.y - 1
                };
            };
        });

        html_spawner.addEventListener("mouseleave", () => {
            html_spawner.style.color = "";
        });
        
        html_right_div.appendChild(html_spawner);
    }

    html_name.textContent = mon;

    // load sprite
    html_sprite.src = `./Assets/Sprites/${mon}.png`;
    html_sprite.style.display = "block";
}

function init(check_sprite_exists: boolean = false) {
    // get HTML elements
    const html_search = document.getElementById("search")! as HTMLInputElement;
    const html_results = document.getElementById("results")! as HTMLSelectElement;
    const cmbbox = document.getElementById("mons")! as HTMLSelectElement;

    // element callbacks
    html_search.addEventListener("input", filter);
    html_results.addEventListener("change", () => {
        const input = html_results.selectedOptions[0].text;
        cmbbox.value = input;
        cmbbox.dispatchEvent(new Event("change", {bubbles: true}));
    });
    cmbbox.addEventListener("change", show_mon);

    // iterate throught every spawner
    let mons: string[] = [];

    for (const biome of BIOMES) {
        if (!biome.finished)
            continue;

        for (let spawner_idx in biome.spawners) {
            for (let mon_idx = 0; mon_idx < biome.spawners[spawner_idx].mons.length; mon_idx++) {
                const mon = biome.spawners[spawner_idx].mons[mon_idx];

                // add mon name in list if needed
                if (!(mons.includes(mon)))
                    mons.push(mon);

                // init mon name in data if needed
                if (!(mon in data))
                    data[mon] = {};

                // init biome name in mon data if needed
                if (!(biome.name in data[mon]))
                    data[mon][biome.name] = {};
                
                data[mon][biome.name][spawner_idx] = [
                    mon_idx + 1,
                    biome.spawners[spawner_idx].mons.length
                ];
            }
        }
    }

    // populate HTML select
    for (const mon of mons.sort()) {
        const opt = document.createElement("option");
        opt.value = mon;
        opt.textContent = mon;
        cmbbox.appendChild(opt);

        if (check_sprite_exists)
            fetch(`./Assets/Sprites/${mon}.png`);
    }
    cmbbox.value = "-";
}

function loop() {
    draw.timer = Math.floor(Date.now() / 333) % 2 * 6;
    draw.draw();
    requestAnimationFrame(loop);
}

init();
loop();
