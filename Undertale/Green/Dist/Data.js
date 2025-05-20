import { Render } from "./Render.js";
export class RotationData {
    constructor(centerX, centerY, angle = 0, prevAngle = 0, targetAngle = 0) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.angle = angle;
        this.prevAngle = prevAngle;
        this.targetAngle = targetAngle;
    }
    setState(total, step) {
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
    constructor(name, size) {
        this.name = name;
        this.size = size;
        Render.loadFont(name);
    }
}
export class ButtonTheme {
    constructor(fontTheme, textCol, textHoverCol, fillCol, fillHoverCol, outlineCol, outlineHoverCol, outlineWidth) {
        this.fontTheme = fontTheme;
        this.textCol = textCol;
        this.textHoverCol = textHoverCol;
        this.fillCol = fillCol;
        this.fillHoverCol = fillHoverCol;
        this.outlineCol = outlineCol;
        this.outlineHoverCol = outlineHoverCol;
        this.outlineWidth = outlineWidth;
    }
}
