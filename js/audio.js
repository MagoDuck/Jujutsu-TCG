const MUSIC_VOLUME_KEY = 'tcg-arena-music-volume';
const MUSIC_MUTED_KEY = 'tcg-arena-music-muted';

const MUSIC_PLAYLIST = [
    './audio/JK1.mp3',
    './audio/JK2.mp3',
    './audio/JK4.mp3'
];

let musicVolume = 0.5;
let musicMuted = false;
let musicUnlocked = false;
let musicTrackIndex = 0;

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

function loadMusicTrack(index) {
    if (!bgMusic || MUSIC_PLAYLIST.length === 0) return;
    musicTrackIndex = ((index % MUSIC_PLAYLIST.length) + MUSIC_PLAYLIST.length) % MUSIC_PLAYLIST.length;
    bgMusic.src = MUSIC_PLAYLIST[musicTrackIndex];
}

function playNextMusicTrack() {
    loadMusicTrack(musicTrackIndex + 1);
    tryPlayMusic();
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
    bgMusic.loop = false;

    loadMusicTrack(0);
    bgMusic.addEventListener('ended', playNextMusicTrack);
    bgMusic.addEventListener('error', () => {}, true);

    const unlock = () => unlockMusicOnFirstInteraction();
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
}

initAudio();

/* ---------- Efeitos sonoros (sintetizados via Web Audio API) ---------- */

let sfxContext = null;

function getSfxContext() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!sfxContext) sfxContext = new Ctx();
    if (sfxContext.state === 'suspended') sfxContext.resume().catch(() => {});
    return sfxContext;
}

const SFX_VOLUME = 0.7;

function getSfxVolume() {
    return SFX_VOLUME;
}

function playTone(ctx, { freq, freqEnd = null, start = 0, duration = 0.12, type = 'sine', peak = 0.25 }) {
    const vol = peak * getSfxVolume();
    if (vol <= 0) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + start;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + duration);
    }

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.03);
}

function playCardClickSound() {
    const ctx = getSfxContext();
    if (!ctx) return;
    playTone(ctx, { freq: 720, freqEnd: 520, duration: 0.09, type: 'triangle', peak: 0.22 });
}

function playButtonClickSound() {
    const ctx = getSfxContext();
    if (!ctx) return;
    playTone(ctx, { freq: 500, freqEnd: 780, duration: 0.07, type: 'square', peak: 0.14 });
}

function playCardPlaceSound() {
    const ctx = getSfxContext();
    if (!ctx) return;
    playTone(ctx, { freq: 180, freqEnd: 90, duration: 0.16, type: 'sine', peak: 0.3 });
    playTone(ctx, { freq: 1200, freqEnd: 300, start: 0.02, duration: 0.08, type: 'triangle', peak: 0.12 });
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('button');
    if (btn) playButtonClickSound();
});
