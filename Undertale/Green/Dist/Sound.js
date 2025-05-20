export class Sound {
    static load(src, isMusic = false) {
        if (!Sound.loaded[src]) {
            const audio = new Audio(Sound.path + (isMusic ? "Musics/" : "") + src);
            audio.loop = isMusic;
            audio.load();
            Sound.loaded[src] = audio;
        }
    }
    static play(src, volume = 1.0, isMusic = false, progress = 0) {
        Sound.load(src, isMusic);
        const audioClone = Sound.loaded[src].cloneNode(true);
        audioClone.volume = volume;
        audioClone.currentTime = progress;
        if (isMusic)
            Sound.music = audioClone;
        audioClone.play().catch((e) => { });
    }
    static stopMusic() {
        if (!Sound.music)
            return;
        Sound.music.pause();
        Sound.music.currentTime = 0;
    }
}
Sound.path = "/Assets/Audio/";
Sound.loaded = {};
