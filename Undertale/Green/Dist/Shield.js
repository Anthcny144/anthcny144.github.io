import { Key } from "./Input.js";
import { Game } from "./Game.js";
import { Arrow } from "./Arrow.js";
import { CenteredObject } from "./Object.js";
import { Hitbox } from "./Hitbox.js";
import { RotationData } from "./Data.js";
import { Side } from "./Side.js";
import { Sound } from "./Sound.js";
export class Shield extends CenteredObject {
    constructor(center, w, h, autoplay) {
        const hitboxes = {
            [Side.Up]: new Hitbox(center.x - 75 / 2, center.y - 75 / 2 + 5, 75, 12),
            [Side.Right]: new Hitbox(center.x + 75 / 2 - 12 - 5, center.y - 75 / 2, 12, 75),
            [Side.Down]: new Hitbox(center.x - 75 / 2, center.y + 75 / 2 - 12 - 5, 75, 12),
            [Side.Left]: new Hitbox(center.x - 75 / 2 + 5, center.y - 75 / 2, 12, 75)
        };
        Shield.hitboxes = hitboxes;
        super(center, w, h, { "off": "shield.png", "on": "shield_hit.png" });
        this.side = Side.Up;
        this.moveCd = 0;
        this.hitCd = 0;
        this.rotData = new RotationData(center.x, center.y);
        this.hb = Shield.hitboxes[this.side];
        this.autoplay = autoplay;
    }
    setSide(side) {
        if (this.moveCd > 0 || this.side == side)
            return;
        this.rotData.prevAngle = this.rotData.angle;
        this.moveCd = Shield.maxMoveCd;
        this.rotData.targetAngle = side * 90;
        this.side = side;
        this.hb = Shield.hitboxes[this.side];
    }
    manageCooldowns() {
        if (this.moveCd > 0)
            this.moveCd--;
        if (this.hitCd > 0)
            this.hitCd--;
    }
    manageState() {
        const target = this.hitCd > 0 ? "on" : "off";
        if (this.activeImg != target)
            this.setImg(target);
    }
    handleKeys() {
        if (Key.isPressed(Key.UP))
            this.setSide(Side.Up);
        else if (Key.isPressed(Key.DOWN))
            this.setSide(Side.Down);
        else if (Key.isPressed(Key.LEFT))
            this.setSide(Side.Left);
        else if (Key.isPressed(Key.RIGHT))
            this.setSide(Side.Right);
    }
    manageRotation() {
        this.rotData.setState(Shield.maxMoveCd, Shield.maxMoveCd - this.moveCd);
    }
    bot(player) {
        const arrows = Arrow.arrows;
        if (arrows.length === 0)
            return;
        const arrow = arrows[0];
        const dist = arrow.distToPlayer(player);
        if (dist <= 70)
            this.setSide(!arrow.reverse ? arrow.side : (arrow.side + 2) % 4);
    }
    hit(player, arrow) {
        Game.score += arrow.getScore(player);
        Game.combo++;
        if (Game.combo > Game.maxCombo)
            Game.maxCombo = Game.combo;
        this.moveCd = 0;
        this.hitCd = Shield.maxHitCd;
        Sound.play("hit.wav", 0.25);
    }
    update(player) {
        this.manageCooldowns();
        this.manageState();
        this.manageRotation();
        if (!this.autoplay)
            this.handleKeys();
        else
            this.bot(player);
    }
}
Shield.maxMoveCd = 4; // frame delay between each direction change
Shield.maxHitCd = 9; // how many frames the shield turns red on arrow hit
