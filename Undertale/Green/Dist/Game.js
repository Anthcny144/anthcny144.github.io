import { Input, Click, Key } from "./Input.js";
import { CenteredObject } from "./Object.js";
import { Player } from "./Player.js";
import { Shield } from "./Shield.js";
import { Render } from "./Render.js";
import { Button } from "./Button.js";
import { Sound } from "./Sound.js";
import { Arrow } from "./Arrow.js";
import { Hitbox } from "./Hitbox.js";
import { Side } from "./Side.js";
import { Img } from "./Img.js";
import { Level, LevelDifficulty } from "./Level.js";
import { FontTheme, ButtonTheme } from "./Data.js";
export class Game {
    constructor(fps, debug = false, autoplay = false) {
        this.debug = debug;
        this.ready = false;
        this.running = true;
        this.frameCount = 0;
        this.objs = {};
        this.buttons = {};
        this.menu = "main";
        this.desc = "";
        this.waveIdx = 0;
        this.fps = fps;
        this.frameTime = 1000 / fps;
        window.addEventListener("DOMContentLoaded", () => {
            this.canvas = document.getElementById("game");
            this.ctx = this.canvas.getContext("2d");
            this.grid = this.canvas.width / 12;
            Game.loadAssets();
            Level.loadDefaultWaves();
            // create main elements
            const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
            this.objs["area"] = new CenteredObject(center, 85, 85, { "area": "area.png" });
            this.objs["circle"] = new CenteredObject(center, 75, 75, { "circle": "circle.png" });
            this.player = new Player(center, 16, 16);
            this.shield = new Shield(center, 75, 75, autoplay);
            // buttons
            const theme = new ButtonTheme(new FontTheme("PixelOperator-Bold", 30), "white", "yellow", // text
            "black", "#101010", // fill
            "white", "yellow", 5 // outline
            );
            Render.loadFont("PixelOperator-Bold");
            // main menu
            this.buttons["main.play"] = new Button(center.x - 100, 70, 200, 50, ["main"], "Play", theme, (game) => { game.setMenu("gamemode"); }, (game) => { game.desc = "Play the game."; }, (game) => { game.desc = ""; });
            this.buttons["main.createlevel"] = new Button(center.x - 100, 140, 200, 50, ["main"], "Create level", theme, (game) => { game.setMenu("createlevel"); }, (game) => { game.desc = "Create a level of your own."; }, (game) => { game.desc = ""; });
            //this.buttons["main.credits"] = new Button(center.x-100, 170, 200, 50, ["main"], "Credits", theme,
            //    (game: Game) => {game.setMenu("credits")}, (game: Game) => {game.desc = "View the game credits."}, (game: Game) => {game.desc = ""});
            // play
            this.buttons["gamemode.easy"] = new Button(center.x - 250, 30, 200, 50, ["gamemode"], "Easy", theme, (game) => { game.startGame(LevelDifficulty.Easy); }, (game) => { game.desc = "Play an easy randomly-generated level."; }, (game) => { game.desc = ""; });
            this.buttons["gamemode.medium"] = new Button(center.x - 250, 100, 200, 50, ["gamemode"], "Medium", theme, (game) => { game.startGame(LevelDifficulty.Medium); }, (game) => { game.desc = "Play a medium randomly-generated level."; }, (game) => { game.desc = ""; });
            this.buttons["gamemode.hard"] = new Button(center.x - 250, 170, 200, 50, ["gamemode"], "Hard", theme, (game) => { game.startGame(LevelDifficulty.Hard); }, (game) => { game.desc = "Play a hard randomly-generated level."; }, (game) => { game.desc = ""; });
            this.buttons["gamemode.specificwave"] = new Button(center.x + 48, 30, 200, 50, ["gamemode"], "Specific wave", theme, (game) => { game.setMenu("specificwave"); }, (game) => { game.desc = "Play a recreation of an existing wave."; }, (game) => { game.desc = ""; });
            this.buttons["gamemode.endlesswaves"] = new Button(center.x + 48, 100, 200, 50, ["gamemode"], "Endless waves", theme, (game) => { game.setMenu("endlesswaves"); }, (game) => { game.desc = "Play random waves recreations until you lose."; }, (game) => { game.desc = ""; });
            this.buttons["gamemode.importlevel"] = new Button(center.x + 48, 170, 200, 50, ["gamemode"], "Import level", theme, (game) => { Level.buildFromJson().then(level => { game.startGame(undefined, level); }); }, (game) => { game.desc = "Import a custom level."; }, (game) => { game.desc = ""; });
            // choose wave
            this.buttons["wave.left"] = new Button(this.grid, this.grid, this.grid, this.grid, ["specificwave", "endlesswaves"], "<", theme, (game) => { game.waveScrollFunc(-1); });
            this.buttons["wave.right"] = new Button(this.canvas.width - this.grid * 2, this.grid, this.grid, this.grid, ["specificwave", "endlesswaves"], ">", theme, (game) => { game.waveScrollFunc(1); });
            this.buttons["wave.wavename"] = new Button(this.grid * 2 + this.grid / 2, this.grid, this.grid * 7, this.grid, ["specificwave", "endlesswaves"], "", theme, (game) => { game.startGame(undefined, Level.defaultWaves[game.waveIdx], game.menu == "endlesswaves"); });
            // back
            const themeSmall = new ButtonTheme(new FontTheme("PixelOperator-Bold", 18), "white", "yellow", // text
            "black", "#101010", // fill
            "white", "yellow", 2 // outline
            );
            this.buttons["back"] = new Button(10, this.canvas.height - 30, 50, 20, ["gamemode", "createlevel", "credits", "play", "winresults", "specificwave", "endlesswaves"], "Back", themeSmall, (game) => { game.backFunc(); }, (game) => { }, (game) => { });
            Input.listen(this.canvas);
            this.ready = true;
        });
    }
    setMenu(menu) {
        this.menu = menu;
        switch (menu) {
            case "main":
            case "gamemode":
                Game.over = false;
                this.player.setImg("player");
                this.player.deadFrames = 0;
                break;
            case "specificwave":
            case "endlesswaves":
                this.waveScrollFunc(0); // init button states / text for waves menus
                break;
            default:
                break;
        }
    }
    setMode(mode) {
        switch (mode) {
            case "easy":
                Sound.play("mus_undyneboss.ogg", 0.5, true);
                break;
            case "medium":
            case "hard":
                Sound.play("mus_x_undyne.ogg", 0.5, true);
                break;
            case "json":
                Sound.play(this.level.music, 0.5, true, this.level.musicStart);
                break;
            default:
                Sound.play("mus_undyneboss.ogg", 0.5, true);
                break;
        }
    }
    startGame(difficulty, level, loop = false) {
        const diffStr = {
            [LevelDifficulty.Easy]: "easy",
            [LevelDifficulty.Medium]: "medium",
            [LevelDifficulty.Hard]: "hard"
        };
        // game
        this.menu = "play";
        this.frameCount = 0;
        // scoring
        Game.score = 0;
        Game.combo = 0;
        Game.maxCombo = 0;
        // arrow
        Arrow.previous = undefined;
        Arrow.closest = undefined;
        Arrow.isFirst = true;
        // player
        this.player.hp = this.player.maxHp;
        // by difficulty
        if (difficulty !== undefined) {
            this.level = new Level(difficulty);
            this.setMode(diffStr[difficulty]);
        }
        // by json
        else if (level) {
            this.level = level;
            this.level.loop = loop;
            this.setMode("json");
        }
        this.level.frame = 0;
        this.level.finish = 0;
    }
    backFunc() {
        switch (this.menu) {
            case "gamemode":
            case "createlevel":
            case "credits":
            case "winresults":
                this.setMenu("main");
                break;
            case "play":
                this.gameOver();
                break;
            case "specificwave":
            case "endlesswaves":
                this.setMenu("gamemode");
                break;
            default:
                break;
        }
    }
    waveScrollFunc(add) {
        if (add < 0 && this.waveIdx > 0)
            this.waveIdx--;
        else if (add > 0 && this.waveIdx < Level.defaultWaves.length - 1)
            this.waveIdx++;
        const left = this.buttons["wave.left"];
        const right = this.buttons["wave.right"];
        this.buttons["wave.wavename"].text = Level.defaultWaves[this.waveIdx].name;
        left.state = this.waveIdx > 0;
        right.state = this.waveIdx < Level.defaultWaves.length - 1;
    }
    gameOver() {
        this.level = undefined;
        this.player.showBar = 0;
        this.player.iframes = 0;
        this.shield.hitCd = 0;
        this.shield.setSide(Side.Up);
        Arrow.arrows = [];
        Game.over = true;
        Sound.stopMusic();
    }
    update() {
        // speed modifiers
        if (this.debug) {
            if (Key.isDown(Key.MINUS))
                this.frameTime = 1000 / (this.fps / 2);
            else if (Key.isDown(Key.PLUS))
                this.frameTime = 0;
            else if (this.frameTime != 1000 / this.fps)
                this.frameTime = 1000 / this.fps;
        }
        // main elements
        this.player.update(this.canvas);
        this.shield.update(this.player);
        if (!Game.over) {
            // update level state
            if (this.level) {
                this.level.progress(this.canvas);
                if (this.level.frame >= this.level.length && Arrow.arrows.length === 0) {
                    this.level.finish++;
                    if (this.level.finish == 30) {
                        this.setMenu("win");
                        Sound.stopMusic();
                        Sound.play("success.wav", 0.5);
                    }
                    else if (this.level.finish == 120) {
                        this.setMenu("winresults");
                        this.player.deadFrames = 240;
                        Game.over = true;
                    }
                }
                // update arrows
                const arrows = Arrow.arrows;
                for (let i = arrows.length - 1; i >= 0; i--) {
                    const arrow = arrows[i];
                    if (!arrow.exists)
                        arrows.splice(i, 1);
                    else
                        arrow.update(this, this.player, this.shield);
                }
            }
            // buttons
            this.updateButtons();
        }
        else {
            // skip end screen (game over or win)
            if (this.player.deadFrames >= 240 && (Click.isPressed(Click.LEFT) || Click.isPressed(Click.RIGHT)))
                this.setMenu(this.menu == "winresults" ? "gamemode" : "main");
        }
    }
    updateButtons() {
        this.hoveringButton = undefined;
        const mousePos = Click.getMousePos();
        // normal buttons
        for (const name in this.buttons) {
            const button = this.buttons[name];
            if (!this.hoveringButton && button.menus.includes(this.menu) && button.hb.isPointIn(mousePos.x, mousePos.y))
                this.hoveringButton = button;
            button.update(this, this.hoveringButton == button);
        }
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // player
        if (!Game.over)
            this.player.drawBlink(this.ctx);
        else if (this.player.deadFrames < 120)
            this.player.draw(this.ctx);
        // game over texts
        if (this.player.deadFrames >= 240) {
            const theme = new FontTheme("PixelOperator-Bold", 40);
            const grid = this.canvas.height / 20;
            // const scoreText = {text: "Your final score is", value: Math.floor(Game.score).toString()};
            // const scoreTextPos = Render.centerTextInRect(this.ctx, scoreText.text, theme, new Hitbox(0, grid*2, this.canvas.width, grid));
            // const scoreValuePos = Render.centerTextInRect(this.ctx, scoreText.value, theme, new Hitbox(0, grid*3.5, this.canvas.width, grid));
            // Render.text(this.ctx, scoreText.text, scoreTextPos.x, scoreTextPos.y, "white", theme);
            // Render.text(this.ctx, scoreText.value, scoreValuePos.x, scoreValuePos.y, "white", theme);
            const comboText = { text: "Your best combo is", value: Math.floor(Game.maxCombo).toString() };
            const comboTextPos = Render.centerTextInRect(this.ctx, comboText.text, theme, new Hitbox(0, grid * 6, this.canvas.width, grid));
            const comboValuePos = Render.centerTextInRect(this.ctx, comboText.value, theme, new Hitbox(0, grid * 7.5, this.canvas.width, grid));
            Render.text(this.ctx, comboText.text, comboTextPos.x, comboTextPos.y, "yellow", theme);
            Render.text(this.ctx, comboText.value, comboValuePos.x, comboValuePos.y, "yellow", theme);
        }
        // player pieces
        this.player.drawPieces(this.ctx);
        // score & combo
        if (this.menu == "play" && !Game.over) {
            // Render.text(this.ctx, Math.floor(Game.score).toString(), 10, this.canvas.height-58, "white", new FontTheme("PixelOperator-Bold", 30));
            Render.text(this.ctx, "x" + Game.combo.toString(), 10, this.canvas.height - 38, "yellow", new FontTheme("PixelOperator-Bold", 25));
        }
        if (!Game.over) {
            // shield
            this.shield.draw(this.ctx, this.shield.rotData);
            // health bar
            if (this.player.showBar > 0) {
                const x = this.canvas.width / 2 - 50;
                const y = this.canvas.height / 2 + 50;
                Render.bar(this.ctx, x, y, 20, 0, this.player.maxHp, this.player.hp, 1, "#EB1010", "#EAEB10");
                this.player.showBar--;
            }
            // other objects
            for (const obj in this.objs)
                this.objs[obj].draw(this.ctx);
            // arrows
            if (this.level) {
                for (const arrow of Arrow.arrows) {
                    if (!arrow.exists)
                        continue;
                    arrow.draw(this.ctx, arrow.rotData, arrow.opacity);
                    if (this.debug)
                        arrow.hb.draw(this.ctx);
                }
            }
        }
        // buttons & wave scroll
        if (this.player.deadFrames === 0) {
            for (const name in this.buttons) {
                const button = this.buttons[name];
                if (button.menus.includes(this.menu))
                    button.draw(this.ctx);
            }
        }
        // help text
        if (this.menu != "play" && this.desc) {
            const hb = new Hitbox(0, this.objs["area"].y + this.objs["area"].h, this.canvas.width, this.canvas.height - (this.objs["area"].y + this.objs["area"].h));
            const fontTheme = new FontTheme("PixelOperator-Bold", 28);
            const textPos = Render.centerTextInRect(this.ctx, this.desc, fontTheme, hb);
            Render.text(this.ctx, this.desc, textPos.x, textPos.y, "white", fontTheme);
        }
        // draw hitboxes
        if (this.debug)
            this.shield.hb.draw(this.ctx);
    }
    run() {
        // run frame
        if (this.ready) {
            // exit if canvas is too small
            if (this.canvas.width < 500 || this.canvas.height < 500 || this.canvas.width != this.canvas.height)
                this.running = false;
            this.update();
            this.draw();
            Input.refresh();
            this.frameCount++;
        }
        if (!this.running) {
            this.canvas.remove();
            return;
        }
        setTimeout(() => this.run(), this.frameTime);
    }
    static loadAssets() {
        // sounds
        Sound.load("heartbeatbreaker.wav");
        Sound.load("heartsplosion.wav");
        Sound.load("hit.wav");
        Sound.load("hurtsound.wav");
        Sound.load("menuconfirm.wav");
        Sound.load("menumove.wav");
        Sound.load("success.wav");
        Sound.load("mus_undyneboss.ogg", true);
        Sound.load("mus_x_undyne.ogg", true);
        // images
        Img.load("area.png");
        Img.load("blue.png");
        Img.load("circle.png");
        Img.load("player.png");
        Img.load("player_dead.png");
        Img.load("player_piece0.png");
        Img.load("player_piece1.png");
        Img.load("red.png");
        Img.load("reverse.png");
        Img.load("shield.png");
        Img.load("shield_hit.png");
    }
}
Game.score = 0;
Game.combo = 0;
Game.maxCombo = 0;
Game.over = false;
