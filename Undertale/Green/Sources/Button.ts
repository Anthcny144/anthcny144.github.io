import {Click} from "./Input.js"
import {Render} from "./Render.js";
import {Hitbox} from "./Hitbox.js";
import {Sound} from "./Sound.js";
import {Game} from "./Game.js";
import {ButtonTheme, FontTheme} from "./Data.js";

export class Button {
    public x: number;
    public y: number;
    public w: number;
    public h: number;

    public text: string;
    public menus: string[];

    public hb: Hitbox;
    public onRelease?: (game: Game) => void;
    public onHover?: (game: Game) => void;
    public onHoverExit?: (game: Game) => void;

    private pressed: boolean = false;
    public hover: boolean = false;

    public state: boolean = true;
    private theme: ButtonTheme;
    private disabledTheme: ButtonTheme;

    constructor(x: number, y: number, w: number, h: number, menus: string[], text: string, theme: ButtonTheme, onRelease?: (game: Game) => void, onHover?: (game: Game) => void, onHoverExit?: (game: Game) => void) {
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

        this.disabledTheme = new ButtonTheme(
            theme.fontTheme,
            "#808080", "#808080",
            theme.fillCol, theme.fillHoverCol,
            "#808080", "#808080",
            theme.outlineWidth
        );
    }

    public update(game: Game, hovering: boolean) {
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
            if (hovering) this.pressed = true;
    
        if ((Click.isReleased(Click.LEFT) || Click.isPressed(Click.RIGHT)) && this.pressed) {
            this.pressed = false;
            if (hovering && this.onRelease) {
                Sound.play("menuconfirm.wav", 0.5);
                this.onRelease(game);
                game.desc = "";
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
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