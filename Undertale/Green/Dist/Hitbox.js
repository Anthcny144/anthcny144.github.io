export class Hitbox {
    constructor(x, y, w, h, color = "red") {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
    }
    getMinX() {
        return this.x;
    }
    getMaxX() {
        return this.x + this.w;
    }
    getMinY() {
        return this.y;
    }
    getMaxY() {
        return this.y + this.h;
    }
    collide(hb) {
        if (this.getMaxX() <= hb.getMinX() || this.getMaxY() <= hb.getMinY() || this.getMinX() >= hb.getMaxX() || this.getMinY() >= hb.getMaxY())
            return false;
        return true;
    }
    isPointIn(x, y) {
        return (x >= this.x && x < this.x + this.w) && (y >= this.y && y < this.y + this.h);
    }
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
    draw(ctx, width = 1) {
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = width;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}
