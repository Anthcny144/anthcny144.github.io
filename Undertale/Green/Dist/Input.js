export class Key {
    static listen() {
        // remove right click
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
        document.addEventListener("keydown", (event) => {
            const idx = this.binds[event.key];
            this.down[idx] = true;
        });
        document.addEventListener("keyup", (event) => {
            const idx = this.binds[event.key];
            this.down[idx] = false;
        });
    }
    static refresh() {
        for (const idx of [Key.UP, Key.DOWN, Key.LEFT, Key.RIGHT, Key.ENTER, Key.SPACE, Key.ESCAPE]) {
            const down = this.down[idx];
            const locked = this.lock[idx];
            this.pressed[idx] = down && !locked;
            this.released[idx] = !down && locked;
            this.lock[idx] = down;
        }
    }
    static isPressed(key) {
        return this.pressed[key];
    }
    static isDown(key) {
        return this.down[key];
    }
    static isReleased(key) {
        return this.released[key];
    }
}
Key.pressed = [false, false, false, false, false, false, false, false, false];
Key.down = [false, false, false, false, false, false, false, false, false];
Key.released = [false, false, false, false, false, false, false, false, false];
Key.lock = [false, false, false, false, false, false, false, false, false];
Key.UP = 0;
Key.DOWN = 1;
Key.LEFT = 2;
Key.RIGHT = 3;
Key.ENTER = 4;
Key.SPACE = 5;
Key.ESCAPE = 6;
Key.MINUS = 7;
Key.PLUS = 8;
Key.binds = {
    "ArrowUp": 0,
    "ArrowDown": 1,
    "ArrowLeft": 2,
    "ArrowRight": 3,
    "Enter": 4,
    " ": 5,
    "Escape": 6,
    "-": 7,
    "+": 8
};
export class Click {
    static listen(canvas) {
        canvas.addEventListener("mousedown", (event) => {
            this.down[event.button] = true;
        });
        canvas.addEventListener("mouseup", (event) => {
            this.down[event.button] = false;
        });
        canvas.addEventListener("mousemove", (event) => {
            if (this.lockMove)
                return;
            this.calculateMousePos(canvas, event);
            this.lockMove = true;
        });
    }
    static refresh() {
        this.lockMove = false;
        for (const idx of [this.LEFT, this.MIDDLE, this.RIGHT, this.NEXT, this.BACK]) {
            const down = this.down[idx];
            const locked = this.lockClick[idx];
            this.pressed[idx] = down && !locked;
            this.released[idx] = !down && locked;
            this.lockClick[idx] = down;
        }
    }
    static isPressed(click) {
        return this.pressed[click];
    }
    static isDown(click) {
        return this.down[click];
    }
    static isReleased(click) {
        return this.released[click];
    }
    static getMousePos() {
        return { x: this.mousePos[0], y: this.mousePos[1] };
    }
    static calculateMousePos(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        this.mousePos = [
            (event.clientX - rect.left) * scaleX,
            (event.clientY - rect.top) * scaleY
        ];
    }
}
Click.LEFT = 0;
Click.MIDDLE = 1;
Click.RIGHT = 2;
Click.NEXT = 3;
Click.BACK = 4;
Click.lockMove = false;
Click.pressed = [false, false, false, false, false];
Click.down = [false, false, false, false, false];
Click.released = [false, false, false, false, false];
Click.lockClick = [false, false, false, false, false];
Click.mousePos = [0, 0];
export class Input {
    static listen(canvas) {
        Key.listen();
        Click.listen(canvas);
    }
    static refresh() {
        Key.refresh();
        Click.refresh();
    }
}
