export class Sound {
    public static path: string = "./Assets/Audio/";
    private static loaded: Record<string, HTMLAudioElement> = {};
    private static music?: HTMLAudioElement;

    public static load(src: string, isMusic: boolean = false) {
        if (!Sound.loaded[src]) {
            const audio = new Audio(Sound.path + (isMusic ? "Musics/" : "") + src);
            audio.loop = isMusic;
            audio.load();
            Sound.loaded[src] = audio;
        }
    }

    public static play(src: string, volume: number = 1.0, isMusic: boolean = false, progress: number = 0) {
        Sound.load(src, isMusic);

        const audioClone = Sound.loaded[src].cloneNode(true) as HTMLAudioElement;
        audioClone.volume = volume;
        audioClone.currentTime = progress;

        if (isMusic)
            Sound.music = audioClone;

        audioClone.play().catch((e) => {});
    }

    public static stopMusic() {
        if (!Sound.music)
            return;

        Sound.music.pause();
        Sound.music.currentTime = 0;
    }
}
