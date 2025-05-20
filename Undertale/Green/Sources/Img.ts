export class Img {
    public static path: string = "./Assets/Images/";
    private static loaded: Record<string, HTMLImageElement> = {};

    public static load(src: string) {
        if (!Img.loaded[src]) {
            const img = new Image();
            img.src = this.path + src;
            Img.loaded[src] = img;
        }
    }

    public static get(src: string): HTMLImageElement {
        Img.load(src);
        return Img.loaded[src];
    }
}
