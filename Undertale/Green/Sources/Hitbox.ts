export class Hitbox {
    constructor(public x: number, public y: number, public w: number, public h: number, public color: string = "red") {}

    private getMinX(): number {
        return this.x;
    }

    private getMaxX(): number {
        return this.x + this.w;
    }

    private getMinY(): number {
        return this.y;
    }

    private getMaxY(): number {
        return this.y + this.h;
    }

    public collide(hb: Hitbox): boolean {
        if (this.getMaxX() <= hb.getMinX() || this.getMaxY() <= hb.getMinY() || this.getMinX() >= hb.getMaxX() || this.getMinY() >= hb.getMaxY())
            return false;
        
        return true;
    }

    public isPointIn(x: number, y: number): boolean {
        return (x >= this.x && x < this.x + this.w) && (y >= this.y && y < this.y + this.h);
    }
    
    public setPos(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public draw(ctx: CanvasRenderingContext2D, width: number = 1) {
        ctx.save();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = width;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        ctx.restore();
    }
}