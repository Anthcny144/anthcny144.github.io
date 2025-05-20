export class RNG {
    static roll(odds) {
        return Math.random() <= odds;
    }
    static getFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    static getInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
