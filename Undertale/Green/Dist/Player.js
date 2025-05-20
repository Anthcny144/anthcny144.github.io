import { CenteredObject } from "./Object.js";
import { Hitbox } from "./Hitbox.js";
import { Sound } from "./Sound.js";
import { Game } from "./Game.js";
import { RNG } from "./RNG.js";
import { Key, Click } from "./Input.js";
export class Player extends CenteredObject {
    constructor(center, w, h) {
        const hb = new Hitbox(center.x - w / 2, center.y - h / 2, w, h);
        super(center, w, h, { "player": "player.png", "dead": "player_dead.png" }, hb);
        this.iframes = 0;
        this.blink = false;
        this.deadFrames = 0;
        this.showBar = 0;
        this.pieces = [];
        this.hb = hb;
        this.maxHp = 100;
        this.hp = this.maxHp;
    }
    hit(game, dmg, iframes) {
        if (this.iframes > 0)
            return;
        this.hp -= dmg;
        this.iframes = iframes;
        this.showBar = 90;
        Sound.play("hurtsound.wav", 0.5);
        // game over
        if (this.hp <= 0) {
            this.iframes = 0;
            game.gameOver();
        }
    }
    update(canvas) {
        if (!Game.over) {
            if (this.iframes > 0)
                this.iframes--;
            this.blink = this.iframes % 10 >= 4 && this.iframes > 0;
        }
        else {
            this.deadFrames++;
            if (this.deadFrames == 60) {
                this.x -= 2;
                this.setImg("dead");
                Sound.play("heartbeatbreaker.wav", 0.5);
            }
            if (this.deadFrames == 120) {
                for (let i = 0; i < 6; i++) {
                    const piece = new Piece(this.getCenter(), RNG.getFloat(0, 360));
                    this.pieces.push(piece);
                }
                this.x += 2;
                Sound.play("heartsplosion.wav", 0.5);
            }
            // speed up with keyboard
            if (Key.isPressed(Key.SPACE) || Key.isPressed(Key.ENTER) || Click.isPressed(Click.LEFT) || Click.isPressed(Click.RIGHT)) {
                const add = 60 - (this.deadFrames % 60) + (this.deadFrames >= 120 && this.deadFrames < 240 ? 60 : 0) - 1;
                this.deadFrames += add;
            }
        }
        this.updatePieces(canvas);
    }
    updatePieces(canvas) {
        for (let i = this.pieces.length - 1; i >= 0; i--) {
            const piece = this.pieces[i];
            if (!piece.exists)
                this.pieces.splice(i, 1);
            else
                piece.update(canvas);
        }
    }
    drawPieces(ctx) {
        for (const piece of this.pieces)
            piece.draw(ctx);
    }
    drawBlink(ctx) {
        ctx.save();
        ctx.globalAlpha = this.blink ? 0.5 : 1;
        this.draw(ctx);
        ctx.restore();
    }
}
class Piece extends CenteredObject {
    constructor(center, angle) {
        super(center, 6, 5, { "0": "player_piece0.png", "1": "player_piece1.png" });
        this.exists = true;
        this.speed = 1;
        this.frame = 0;
        const angleRad = angle * (Math.PI / 180);
        this.vel = {
            x: Math.cos(angleRad) * this.speed,
            y: Math.sin(angleRad) * this.speed
        };
    }
    update(canvas) {
        this.setImg(this.frame % 30 < 15 ? "1" : "0");
        this.frame++;
        this.x += this.vel.x;
        this.y += this.vel.y;
        this.vel.y += 0.04; // gravity
        if (this.y > canvas.height)
            this.exists = false;
    }
}
