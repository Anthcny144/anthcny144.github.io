import { Img } from "./Img.js";
export class CenteredObject {
    constructor(center, w, h, srcs, hb) {
        this.imgs = {};
        this.activeImg = "";
        this.x = Math.round(center.x - w / 2);
        this.y = Math.round(center.y - h / 2);
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
    setImg(name) {
        if (name in this.imgs) {
            this.img = this.imgs[name];
            this.activeImg = name;
            return true;
        }
        return false;
    }
    getCenter() {
        return {
            x: this.x + this.w / 2,
            y: this.y + this.h / 2
        };
    }
    draw(ctx, rot, opacity) {
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
            ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
        }
        // normal draw
        else
            ctx.drawImage(this.img, this.x, this.y);
        if (ctxSave)
            ctx.restore();
    }
}
export class Object extends CenteredObject {
    constructor(x, y, w, h, srcs, hb) {
        super({ x: x, y: y }, w, h, srcs, hb);
    }
}
