import {Key} from "./Input.js"
import {Game} from "./Game.js"
import {Player} from "./Player.js"
import {Arrow} from "./Arrow.js"
import {CenteredObject} from "./Object.js"
import {Hitbox} from "./Hitbox.js"
import {RotationData} from "./Data.js"
import {Side} from "./Side.js"
import {Sound} from "./Sound.js"

export class Shield extends CenteredObject {
    private static hitboxes: Record<Side, Hitbox>;
    private static maxMoveCd: number = 4; // frame delay between each direction change
    private static maxHitCd: number = 9; // how many frames the shield turns red on arrow hit

    public hb: Hitbox;

    public side: Side = Side.Up;
    public moveCd: number = 0;
    public hitCd: number = 0;

    public rotData: RotationData;

    public autoplay: boolean;

    constructor(center: Record<string, number>, w: number, h: number, autoplay: boolean) {
        const hitboxes: Record<Side, Hitbox> = {
            [Side.Up]: new Hitbox(center.x - 75 / 2, center.y - 75 / 2 + 5, 75, 12),
            [Side.Right]: new Hitbox(center.x + 75 / 2 - 12 - 5, center.y - 75 / 2, 12, 75),
            [Side.Down]: new Hitbox(center.x - 75 / 2, center.y + 75 / 2 - 12 - 5, 75, 12),
            [Side.Left]: new Hitbox(center.x - 75 / 2 + 5, center.y - 75 / 2, 12, 75)
        };
        Shield.hitboxes = hitboxes;

        super(center, w, h, {"off": "shield.png", "on": "shield_hit.png"});

        this.rotData = new RotationData(center.x, center.y);
        this.hb = Shield.hitboxes[this.side];

        this.autoplay = autoplay;
    }

    public setSide(side: Side) {
        if (this.moveCd > 0 || this.side == side)
            return;

        this.rotData.prevAngle = this.rotData.angle;
        this.moveCd = Shield.maxMoveCd;
        this.rotData.targetAngle = side * 90;
        this.side = side;
        this.hb = Shield.hitboxes[this.side];
    }

    private manageCooldowns() {
        if (this.moveCd > 0) this.moveCd--;
        if (this.hitCd > 0) this.hitCd--;
    }

    private manageState() {
        const target = this.hitCd > 0 ? "on" : "off";
        if (this.activeImg != target)
            this.setImg(target);
    }

    private handleKeys() {
        if (Key.isPressed(Key.UP)) this.setSide(Side.Up);
        else if (Key.isPressed(Key.DOWN)) this.setSide(Side.Down);
        else if (Key.isPressed(Key.LEFT)) this.setSide(Side.Left);
        else if (Key.isPressed(Key.RIGHT)) this.setSide(Side.Right);
    }

    private manageRotation() {
        this.rotData.setState(Shield.maxMoveCd, Shield.maxMoveCd - this.moveCd);
    }

    private bot(player: Player) {
        const arrows = Arrow.arrows;
        if (arrows.length === 0)
            return;

        const arrow = arrows[0];

        const dist = arrow.distToPlayer(player);
        if (dist <= 70)
            this.setSide(!arrow.reverse ? arrow.side : (arrow.side + 2) % 4);
    }

    public hit(player: Player, arrow: Arrow) {
        Game.score += arrow.getScore(player);
        Game.combo++;

        if (Game.combo > Game.maxCombo)
            Game.maxCombo = Game.combo;

        this.moveCd = 0;
        this.hitCd = Shield.maxHitCd;
        Sound.play("hit.wav", 0.25);
    }

    public update(player: Player) {
        this.manageCooldowns();
        this.manageState();
        this.manageRotation();

        if (!this.autoplay)
            this.handleKeys();
        else
            this.bot(player);
    }
}