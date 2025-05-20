import { Click } from "./Input.js";
import { Render } from "./Render.js";
import { Hitbox } from "./Hitbox.js";
import { Sound } from "./Sound.js";
import { ButtonTheme } from "./Data.js";
export class Button {
    constructor(x, y, w, h, menus, text, theme, onRelease, onHover, onHoverExit) {
        this.pressed = false;
        this.hover = false;
        this.state = true;
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.w = Math.round(w);
        this.h = Math.round(h);
        this.text = text;
        this.theme = theme;
        this.menus = menus;
        this.hb = new Hitbox(x, y, w, h);
        this.onRelease = onRelease;
        this.onHover = onHover;
        this.onHoverExit = onHoverExit;
        this.disabledTheme = new ButtonTheme(theme.fontTheme, "#808080", "#808080", theme.fillCol, theme.fillHoverCol, "#808080", "#808080", theme.outlineWidth);
    }
    update(game, hovering) {
        if (!this.menus.includes(game.menu) || !this.state)
            return;
        // handle hover
        if (hovering && !this.hover) {
            this.hover = true;
            Sound.play("menumove.wav", 0.25);
            if (this.onHover)
                this.onHover(game);
        }
        else if (!hovering && this.hover) {
            this.hover = false;
            if (this.onHoverExit)
                this.onHoverExit(game);
        }
        if (Click.isPressed(Click.LEFT) || Click.isPressed(Click.RIGHT))
            if (hovering)
                this.pressed = true;
        if ((Click.isReleased(Click.LEFT) || Click.isPressed(Click.RIGHT)) && this.pressed) {
            this.pressed = false;
            if (hovering && this.onRelease) {
                Sound.play("menuconfirm.wav", 0.5);
                this.onRelease(game);
                game.desc = "";
            }
        }
    }
    draw(ctx) {
        const hover = this.hover;
        const theme = this.state ? this.theme : this.disabledTheme;
        const textCol = hover ? theme.textHoverCol : theme.textCol;
        const fillCol = hover ? theme.fillHoverCol : theme.fillHoverCol;
        const outlineCol = hover ? theme.outlineHoverCol : theme.outlineCol;
        const outlineWidth = theme.outlineWidth;
        const textPos = Render.centerTextInRect(ctx, this.text, theme.fontTheme, new Hitbox(this.x, this.y, this.w, this.h));
        Render.rect(ctx, this.x, this.y, this.w, this.h, fillCol, outlineWidth, outlineCol);
        Render.text(ctx, this.text, textPos.x, textPos.y, textCol, theme.fontTheme);
    }
}
