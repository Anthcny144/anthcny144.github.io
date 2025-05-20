export class Render {
    static rect(ctx, x, y, w, h, fillCol, outWidth, outCol) {
        const hasOutline = outWidth && outCol;
        // default values for undefined vars
        outWidth !== null && outWidth !== void 0 ? outWidth : (outWidth = 0);
        outCol !== null && outCol !== void 0 ? outCol : (outCol = "white");
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
        ctx.fillRect(x + outWidth / 2, y + outWidth / 2, w - outWidth, h - outWidth);
        ctx.restore();
    }
    static bar(ctx, x, y, height, min, max, value, step, inCol, outCol) {
        const fullWidth = Math.abs(max - min) * step;
        const inW = Math.abs(value - min) * step;
        Render.rect(ctx, x + inW, y, fullWidth - inW, height, inCol);
        Render.rect(ctx, x, y, inW, height, outCol);
    }
    static loadFont(name) {
        if (!Render.fonts[name]) {
            const font = new FontFace(name, "url(./Assets/Fonts/" + name + ".ttf)");
            Render.fonts[name] = font.load().then((loadedFont) => {
                document.fonts.add(loadedFont);
                return loadedFont;
            });
        }
        return Render.fonts[name];
    }
    static centerTextInRect(ctx, text, theme, hitbox) {
        ctx.save();
        ctx.font = `${theme.size}px '${theme.name}'`;
        ctx.imageSmoothingEnabled = false;
        const textSize = ctx.measureText(text);
        const textHeight = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;
        const centerText = {
            x: hitbox.x + (hitbox.w / 2) - (textSize.width / 2),
            y: hitbox.y + (hitbox.h / 2) + (textHeight / 2)
        };
        ctx.restore();
        return centerText;
    }
    static text(ctx, text, x, y, color, theme) {
        ctx.save();
        ctx.font = `${theme.size}px '${theme.name}'`;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
}
Render.fonts = {};
