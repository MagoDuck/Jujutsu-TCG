const MUSIC_VOLUME_KEY = 'tcg-arena-music-volume';
const MUSIC_MUTED_KEY = 'tcg-arena-music-muted';

let musicVolume = 0.5;
let musicMuted = false;
let musicUnlocked = false;

function loadAudioPreferences() {
    try {
        const savedVolume = localStorage.getItem(MUSIC_VOLUME_KEY);
        if (savedVolume !== null) musicVolume = Math.min(1, Math.max(0, parseFloat(savedVolume)));
        const savedMuted = localStorage.getItem(MUSIC_MUTED_KEY);
        if (savedMuted !== null) musicMuted = savedMuted === 'true';
    } catch (error) {
        console.warn('Nao foi possivel carregar as preferencias de audio.', error);
    }
}

function saveAudioPreferences() {
    try {
        localStorage.setItem(MUSIC_VOLUME_KEY, String(musicVolume));
        localStorage.setItem(MUSIC_MUTED_KEY, String(musicMuted));
    } catch (error) {
        console.warn('Nao foi possivel salvar as preferencias de audio.', error);
    }
}

function tryPlayMusic() {
    if (!bgMusic || musicMuted) return;
    const playPromise = bgMusic.play();
    if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
    }
}

function applyMusicState() {
    if (!bgMusic) return;
    bgMusic.volume = musicVolume;
    bgMusic.muted = musicMuted;
    if (musicMuted) {
        bgMusic.pause();
    } else if (musicUnlocked) {
        tryPlayMusic();
    }
}

function getMusicVolume() { return musicVolume; }
function isMusicMuted() { return musicMuted; }

function setMusicVolume(v) {
    musicVolume = Math.min(1, Math.max(0, Number(v) || 0));
    saveAudioPreferences();
    applyMusicState();
}

function setMusicMuted(muted) {
    musicMuted = !!muted;
    saveAudioPreferences();
    applyMusicState();
}

function unlockMusicOnFirstInteraction() {
    if (musicUnlocked) return;
    musicUnlocked = true;
    applyMusicState();
}

function initAudio() {
    loadAudioPreferences();
    if (!bgMusic) return;

    bgMusic.volume = musicVolume;
    bgMusic.muted = musicMuted;

    // Sem arquivo em audio/musica.mp3 ainda, a reprodução falha silenciosamente.
    bgMusic.addEventListener('error', () => {}, true);

    const unlock = () => unlockMusicOnFirstInteraction();
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
}

initAudio();
