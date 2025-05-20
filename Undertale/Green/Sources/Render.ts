import {FontTheme} from "./Data.js";
import {Hitbox} from "./Hitbox.js";

export class Render {
    public static rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fillCol: string, outWidth?: number, outCol?: string) {
        const hasOutline = outWidth && outCol;
        
        // default values for undefined vars
        outWidth ??= 0;
        outCol ??= "white";

        ctx.save();

        // outline
        if (hasOutline) {
            ctx.beginPath();
            ctx.lineWidth = outWidth;
            ctx.strokeStyle = outCol;
            ctx.rect(x, y, w, h);
            ctx.stroke();
        }
        
        // inside
        ctx.fillStyle = fillCol;
        ctx.fillRect(
            x + outWidth / 2,
            y + outWidth / 2,
            w - outWidth,
            h - outWidth
        );
        
        ctx.restore();
    }

    public static bar(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, min: number, max: number, value: number, step: number, inCol: string, outCol: string) {
        const fullWidth = Math.abs(max - min) * step;
        const inW = Math.abs(value - min) * step;

        Render.rect(ctx, x + inW, y, fullWidth - inW, height, inCol);
        Render.rect(ctx, x, y, inW, height, outCol);
    }

    private static fonts: Record<string, Promise<FontFace>> = {};

    public static loadFont(name: string): Promise<FontFace> {
        if (!Render.fonts[name]) {
            const font = new FontFace(name, "url(/Assets/Fonts/" + name + ".ttf)");

            Render.fonts[name] = font.load().then((loadedFont) => {
                (document as any).fonts.add(loadedFont);
                return loadedFont;
            });
        }

        return Render.fonts[name];
    }
    
    public static centerTextInRect(ctx: CanvasRenderingContext2D, text: string, theme: FontTheme, hitbox: Hitbox): Record<string, number> {
        ctx.save();
        ctx.font = `${theme.size}px '${theme.name}'`;
        ctx.imageSmoothingEnabled = false;

        const textSize = ctx.measureText(text);
        const textHeight = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;

        const centerText = {
            x: hitbox.x + (hitbox.w/2) - (textSize.width/2),
            y: hitbox.y + (hitbox.h/2) + (textHeight/2)
        };

        ctx.restore();

        return centerText;
    }

    public static text(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, theme: FontTheme) {
        ctx.save();
        ctx.font = `${theme.size}px '${theme.name}'`;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
}