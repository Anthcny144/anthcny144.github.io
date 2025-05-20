import {Render} from "./Render.js";

export class RotationData {
    constructor(public centerX: number, public centerY: number, public angle: number = 0, public prevAngle: number = 0, public targetAngle: number = 0) {}

    public setState(total: number, step: number) {
        if (total === 0) {
            this.angle = this.targetAngle;
            return;
        }
    
        const t = step / total;
        const delta = ((this.targetAngle - this.prevAngle + 540) % 360) - 180;
        this.angle = this.prevAngle + delta * t;
    }
}

export class FontTheme {
    constructor(public name: string, public size: number) {
        Render.loadFont(name);
    }
}

export class ButtonTheme {
    constructor(public fontTheme: FontTheme,
                public textCol: string, public textHoverCol: string,
                public fillCol: string, public fillHoverCol: string,
                public outlineCol: string, public outlineHoverCol: string, public outlineWidth: number) {}
}