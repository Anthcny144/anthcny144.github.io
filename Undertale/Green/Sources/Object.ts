import {Hitbox} from "./Hitbox.js"
import {RotationData} from "./Data.js";
import {Img} from "./Img.js"

export class CenteredObject {
    public x: number;
    public y: number;
    public w: number;
    public h: number;
    public hb?: Hitbox;

    private imgs: Record<string, HTMLImageElement> = {};
    private img?: HTMLImageElement;
    public activeImg: string = "";

    constructor(center: Record<string, number>, w: number, h: number, srcs: Record<string, string>, hb?: Hitbox) {
        this.x = Math.round(center.x - w/2);
        this.y = Math.round(center.y - h/2);
        this.w = w;
        this.h = h;

        for (const name in srcs) {
            let img = Img.get(srcs[name]);
            this.imgs[name] = img;

            if (!this.img)
                this.setImg(name);
        }

        if (hb)
            this.hb = hb;
    }

    public setImg(name: string): boolean {
        if (name in this.imgs) {
            this.img = this.imgs[name];
            this.activeImg = name;
            return true;
        }

        return false;
    }

    public getCenter(): Record<string, number> {
        return {
            x: this.x + this.w/2,
            y: this.y + this.h/2
        }
    }

    public draw(ctx: CanvasRenderingContext2D, rot?: RotationData, opacity?: number) {
        if (!this.img)
            return;

        const ctxSave = rot !== undefined || opacity !== undefined;
        
        if (ctxSave)
            ctx.save();

        // opacity
        if (opacity !== undefined)
            ctx.globalAlpha = opacity;

        // rotation draw
        if (rot) {
            ctx.translate(rot.centerX, rot.centerY);
            ctx.rotate(rot.angle * Math.PI / 180);
            ctx.drawImage(this.img, -this.w/2, -this.h/2, this.w, this.h);
        }

        // normal draw
        else
            ctx.drawImage(this.img, this.x, this.y)

        if (ctxSave)
            ctx.restore();
    }
}

export class Object extends CenteredObject {
    constructor(x: number, y: number, w: number, h: number, srcs: Record<string, string>, hb?: Hitbox) {
        super({x: x, y: y}, w, h, srcs, hb);
    }
}