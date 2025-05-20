export class Key {
    private static pressed: boolean[] = [false, false, false, false, false, false, false,  false, false];
    private static down: boolean[] = [false, false, false, false, false, false, false,  false, false];
    private static released: boolean[] = [false, false, false, false, false, false, false,  false, false];
    private static lock: boolean[] = [false, false, false, false, false, false, false,  false, false];

    public static UP = 0;
    public static DOWN = 1;
    public static LEFT = 2;
    public static RIGHT = 3;
    public static ENTER = 4;
    public static SPACE = 5;
    public static ESCAPE = 6;
    public static MINUS = 7;
    public static PLUS = 8;

    private static binds: Record<string, number> = {
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

    public static listen() {
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

    public static refresh() {
        for (const idx of [Key.UP, Key.DOWN, Key.LEFT, Key.RIGHT, Key.ENTER, Key.SPACE, Key.ESCAPE]) {
            const down = this.down[idx];
            const locked = this.lock[idx];

            this.pressed[idx] = down && !locked;
            this.released[idx] = !down && locked;

            this.lock[idx] = down;
        }
    }

    public static isPressed(key: number): boolean {
        return this.pressed[key];
    }

    public static isDown(key: number): boolean {
        return this.down[key];
    }

    public static isReleased(key: number): boolean {
        return this.released[key];
    }
}

export class Click {
    public static LEFT: number = 0;
    public static MIDDLE: number = 1;
    public static RIGHT: number = 2;
    public static NEXT: number = 3;
    public static BACK: number = 4;

    private static lockMove: boolean = false;
    private static pressed: boolean[] = [false, false, false, false, false];
    private static down: boolean[] = [false, false, false, false, false];
    private static released: boolean[] = [false, false, false, false, false];
    private static lockClick: boolean[] = [false, false, false, false, false];
    private static mousePos: number[] = [0, 0];

    public static listen(canvas: HTMLCanvasElement) {
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

    public static refresh() {
        this.lockMove = false;
    
        for (const idx of [this.LEFT, this.MIDDLE, this.RIGHT, this.NEXT, this.BACK]) {
            const down = this.down[idx];
            const locked = this.lockClick[idx];
    
            this.pressed[idx] = down && !locked;
            this.released[idx] = !down && locked;
    
            this.lockClick[idx] = down;
        }
    }

    public static isPressed(click: number): boolean {
        return this.pressed[click];
    }

    public static isDown(click: number): boolean {
        return this.down[click];
    }

    public static isReleased(click: number): boolean {
        return this.released[click];
    }

    public static getMousePos(): Record<string, number> {
        return {x: this.mousePos[0], y: this.mousePos[1]};
    }

    private static calculateMousePos(canvas: HTMLCanvasElement, event: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const scaleX: number = canvas.width / rect.width;
        const scaleY: number = canvas.height / rect.height;

        this.mousePos = [
            (event.clientX - rect.left) * scaleX,
            (event.clientY - rect.top) * scaleY
        ];
    }
}

export class Input {
    public static listen(canvas: HTMLCanvasElement) {
        Key.listen();
        Click.listen(canvas);
    }

    public static refresh() {
        Key.refresh();
        Click.refresh();
    }
}