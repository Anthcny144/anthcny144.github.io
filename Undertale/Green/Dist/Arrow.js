import { Game } from "./Game.js";
import { CenteredObject } from "./Object.js";
import { Hitbox } from "./Hitbox.js";
import { Side } from "./Side.js";
import { RNG } from "./RNG.js";
import { RotationData } from "./Data.js";
/**
 * The data for the type of the arrow
 * @param reverse Force the type of the arrow (normal or reverse)
 * @param odds If `reverse` is `true`, set the odds for an arrow to spawn as reverse. See the `RNG` class for more info. If let empty, 100% chance for reverse arrows
 */
export class ArrowType {
    constructor(reverseOdds) {
        this.reverse = RNG.roll(reverseOdds);
    }
}
/**
 * The data for the side where the arrow will spawn
 * @param side Force the arrow to spawn in a specific side. Either a `Side`, use `undefined` for random sides
 * @param differentSide If `side` is undefined, prevent the arrows to spawn at the same side than the previous one
 * @param reverse If `side` is undefined, specify whether the arrow to create is reverse or not
 */
export class ArrowSide {
    constructor(side, differentSide = false, reverse = false) {
        if (side != undefined)
            this.side = side;
        else {
            let side;
            let prevSide;
            let newDest;
            const prevArrow = Arrow.previous;
            // if prev arrow is reverse, prev side is its destination, not spawn
            if (prevArrow) {
                if (prevArrow.reverse)
                    prevSide = (prevArrow.side + 2) % 4;
                else
                    prevSide = prevArrow.side;
            }
            else
                prevSide = undefined;
            do {
                const rng = Math.random();
                if (rng < 0.25)
                    side = Side.Up;
                else if (rng < 0.50)
                    side = Side.Right;
                else if (rng < 0.75)
                    side = Side.Down;
                else
                    side = Side.Left;
                newDest = reverse ? (side + 2) % 4 : side;
            } while (Arrow.previous && differentSide && newDest === prevSide);
            this.side = side;
        }
    }
}
/**
 * The data for the speed of the arrow
 * @param speed Force the speed of the arrow. Use `undefined` for random speed
 * @param random If `speed` is `undefined`, pass an array of the minimal and maximal range for the random speed (float type)
 */
export class ArrowSpeed {
    constructor(speed, random = []) {
        if ((!speed && random.length == 0) || (speed && random.length != 0))
            throw new Error(`Wrong ArrowType data: ${speed}, ${random}`);
        if (speed)
            this.speed = speed;
        else {
            const min = random[0];
            const max = random[1];
            this.speed = Math.random() * (max - min) + min;
        }
    }
}
export class Arrow extends CenteredObject {
    constructor(canvas, frameCount, type, side, speed, fadeout = false, dmg = 10, iframes = 60) {
        let x = 0, y = 0;
        const w = 24, h = 30;
        // position depending on spawn side
        switch (side.side) {
            case Side.Up:
                x = canvas.width / 2 - 12;
                y = -30;
                break;
            case Side.Down:
                x = canvas.width / 2 - 12;
                y = canvas.height + 6;
                break;
            case Side.Left:
                x = -30;
                y = canvas.height / 2 - 12;
                break;
            case Side.Right:
                x = canvas.width + 6;
                y = canvas.height / 2 - 12;
                break;
        }
        const srcs = {
            "blue": "blue.png",
            "red": "red.png",
            "reverse": "reverse.png"
        };
        // data
        const hb = new Hitbox(x, y, w, w); // pos is updated every frame anyway
        super({ x: x + w / 2, y: y + h / 2 }, w, h, srcs, hb);
        this.opacity = 1;
        this.exists = true;
        this.reversing = false;
        this.reverseProg = 0;
        this.hasReversed = false;
        this.rotData = new RotationData(0, 0);
        this.reverse = type.reverse;
        this.side = side.side;
        this.speed = speed.speed;
        this.fadeout = fadeout;
        this.dmg = dmg;
        this.iframes = iframes;
        this.hb = hb;
        this.frame = frameCount;
        // if first arrow, mark arrow as the closest
        if (!Arrow.closest)
            Arrow.closest = this;
        // set valid img depending on closest / reverse
        if (this.reverse)
            this.setImg("reverse");
        else if (Arrow.closest == this)
            this.setImg("red");
        Arrow.isFirst = false;
        Arrow.previous = this;
    }
    update(game, player, shield) {
        const pDist = this.distToPlayer(player);
        // opacity
        if (this.fadeout && pDist <= 230)
            this.opacity = Math.max(0, Math.min(1, (pDist - 180) / (230 - 180)));
        // manage reverse rotation
        if ((pDist <= 90 && this.reverse && !this.hasReversed) || this.reversing) {
            this.reversing = true;
            if (this.reverseProg < 10) {
                this.reverseRotate(player);
                this.reverseProg++;
            }
            else {
                this.speed = -this.speed;
                this.reversing = false;
                this.hasReversed = true;
                return;
            }
        }
        // normal behavior
        else {
            switch (this.side) {
                case Side.Up:
                    this.y += this.speed;
                    break;
                case Side.Down:
                    this.y -= this.speed;
                    break;
                case Side.Left:
                    this.x += this.speed;
                    break;
                case Side.Right:
                    this.x -= this.speed;
                    break;
            }
        }
        // match rotation with spawn side
        const angle = this.side * 90 + (!this.reverse ? 180 : 0);
        this.rotData = new RotationData(this.x + 12, this.y + 12, angle, angle, angle);
        this.rotData.setState(1, 1);
        // collisions
        let xHbOffs = 0, yHbOffs = 0;
        switch (this.side) {
            case Side.Up:
                yHbOffs = -2;
                break;
            case Side.Down:
                yHbOffs = 2;
                break;
            case Side.Left:
                xHbOffs = -2;
                break;
            case Side.Right:
                xHbOffs = 2;
                break;
        }
        ;
        this.hb.setPos(this.x + xHbOffs, this.y + yHbOffs);
        const pHit = this.hb.collide(player.hb);
        const sHit = this.hb.collide(shield.hb);
        this.exists = !pHit && !sHit;
        if (sHit)
            shield.hit(player, this);
        else if (pHit) {
            Game.combo = 0;
            player.hit(game, this.dmg, this.iframes);
        }
        // get closest arrow
        if (!this.exists && Arrow.closest == this) {
            Arrow.closest = Arrow.getClosest(player);
            if (Arrow.closest && !Arrow.closest.reverse)
                Arrow.closest.setImg("red");
        }
    }
    distToPlayer(player) {
        const diff = {
            x: Math.abs(player.x - this.x),
            y: Math.abs(player.y - this.y)
        };
        return Math.sqrt(diff.x * diff.x + diff.y * diff.y);
    }
    reverseRotate(player) {
        const degToRad = Math.PI / 180;
        const radian = degToRad * 18;
        const cosA = Math.cos(radian);
        const sinA = Math.sin(radian);
        const pCenter = player.getCenter();
        const center = {
            x: pCenter.x - this.w / 2,
            y: pCenter.y - this.w / 2 // arrow is a rect but its hitbox is a square
        };
        const dx = this.x - center.x;
        const dy = this.y - center.y;
        this.x = cosA * dx - sinA * dy + center.x;
        this.y = sinA * dx + cosA * dy + center.y;
    }
    static getClosest(player) {
        let minDist;
        let closest;
        for (const arrow of Arrow.arrows) {
            if (!arrow.exists)
                continue;
            const dist = arrow.distToPlayer(player);
            if ((!minDist || !closest) || dist < minDist) {
                minDist = dist;
                closest = arrow;
            }
        }
        return closest;
    }
    getScore(player) {
        return 0;
        /*

        // get how many frames between current and last arrows
        const spawnDiff = Arrow.previous !== undefined ? this.frame - Arrow.previous.frame : this.frame;

        // speed
        const speedVal = !Arrow.isFirst
        ? Math.pow(1.2, Math.max(0, this.speed - 3))
        : this.speed;
        
        // spawn difference
        const spawnMult = Math.pow(1.15, Arrow.isFirst ? 1 : 60 / spawnDiff);

        // reverse bonus
        const typeMult = this.reverse ? 2 : 1;

        // fadeout bonus
        const fadeoutMult = this.fadeout ? 1.5 : 1;

        // same side prenalty
        const sameSidePena = Arrow.previous !== undefined && Arrow.previous.side == this.side;

        // if sameSidePena, nullify mults
        return speedVal * (!sameSidePena ? spawnMult : 1) * (!sameSidePena ? typeMult : 1) * (!sameSidePena ? fadeoutMult : 1);

        */
    }
}
Arrow.isFirst = true;
Arrow.arrows = [];
