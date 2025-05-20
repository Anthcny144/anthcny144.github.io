export class Img {
    static load(src) {
        if (!Img.loaded[src]) {
            const img = new Image();
            img.src = this.path + src;
            Img.loaded[src] = img;
        }
    }
    static get(src) {
        Img.load(src);
        return Img.loaded[src];
    }
}
Img.path = "./Assets/Images/";
Img.loaded = {};
