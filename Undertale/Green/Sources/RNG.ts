export class RNG {
    public static roll(odds: number): boolean {
        return Math.random() <= odds;
    }

    public static getFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    public static getInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min);
    }
}