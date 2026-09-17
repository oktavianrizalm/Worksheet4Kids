import { cariManifestAudio } from './manifest';
import { getPreferensiOrangTua, simpanPreferensiOrangTua } from '../preferensi';

let audioCtx: AudioContext | null = null;
let isUnlocked = false;

export function isAudioInstruksiAktif(): boolean {
  return getPreferensiOrangTua().audioInstruksiAktif;
}

export function setAudioInstruksiAktif(aktif: boolean): void {
  simpanPreferensiOrangTua({ audioInstruksiAktif: aktif });
}

// 4.0d: Resume AudioContext saat dokumen kembali terlihat (mengatasi suspend iOS)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  });
}

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

/**
 * Membuka kunci audio pada gesture pertama di beranda.
 * Memanggil ctx.resume() dan memutar buffer senyap 1 sample.
 */
export async function unlockAudio(): Promise<void> {
  if (isUnlocked) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    isUnlocked = true;
  } catch (err) {
    console.warn('Gagal melakukan unlock audio:', err);
  }
}

/**
 * Efek nada bel sukses: dua nada naik (660 Hz -> 880 Hz), masing-masing ~90 ms,
 * gain envelope naik-turun halus, puncak gain <= 0.18.
 * CATATAN: TIDAK ADA fungsi suara salah.
 */
export function mainkanSukses(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    // Nada 1: 660 Hz (~90 ms)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(660, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.09);

    // Nada 2: 880 Hz (~90 ms) menyusul di now + 0.08
    const t2 = now + 0.08;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, t2);
    gain2.gain.setValueAtTime(0.001, t2);
    gain2.gain.exponentialRampToValueAtTime(0.18, t2 + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.09);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t2);
    osc2.stop(t2 + 0.09);
  } catch (e) {
    console.warn('Gagal memutar audio sukses:', e);
  }
}

/**
 * Glob berkas audio dari src/assets/audio/ untuk bundler Vite.
 * Hasil asset mendapat nama hash untuk precaching offline PWA.
 */
const urlAudio = import.meta.glob('../assets/audio/*.{mp3,wav,m4a}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

// Map: nama berkas (misal "cocokkan-warna.default.mp3") -> resolved URL string
const audioUrlMap = new Map<string, string>();

for (const [key, url] of Object.entries(urlAudio)) {
  const fileName = key.split('/').pop();
  if (fileName) {
    audioUrlMap.set(fileName, url);
  }
}

/**
 * Cache HTMLAudioElement per audioId (3.0c).
 * Menghindari pemanggilan new Audio() berulang-ulang pada audioId yang sama.
 */
const audioInstanceCache = new Map<string, HTMLAudioElement>();

/**
 * Menyiapkan elemen audio instruksi secara SINKRON.
 * Jika berkas belum ada di src/assets/audio/, mengembalikan null secara tenang tanpa melempar error.
 */
export function siapkanInstruksi(audioId: string): HTMLAudioElement | null {
  if (!isAudioInstruksiAktif()) {
    return null;
  }

  // Cek cache instans terlebih dahulu
  const cached = audioInstanceCache.get(audioId);
  if (cached) {
    return cached;
  }

  const entry = cariManifestAudio(audioId);
  if (!entry) return null;

  const url = audioUrlMap.get(entry.namaBerkas);
  if (!url) {
    return null; // Berkas belum ada
  }

  // Buat instans baru sekali, lalu simpan di cache
  const audio = new Audio(url);
  audioInstanceCache.set(audioId, audio);
  return audio;
}
