/**
 * MODUL MUSIK LATAR (Background Music)
 *
 * Aturan:
 * 1. Lazy init: elemen <audio> dibuat hanya saat gesture pertama.
 * 2. Loop otomatis, volume rendah (0.18) agar tidak mengganggu narasi instruksi.
 * 3. Preferensi musikAktif disimpan bersama prefOrtu di localStorage.
 * 4. Tidak memblokir rendering - tidak ada fetch, tidak ada decode di main thread.
 * 5. Graceful degradation: jika file tidak ada atau browser reject, diam saja.
 */

import { getPreferensiOrangTua, simpanPreferensiOrangTua } from '../preferensi';

/** Volume musik latar: cukup terdengar tapi tidak mengganggu audio instruksi (0-1) */
const VOLUME_BGM = 0.18;

/** Path file di /public/ - dimuat langsung oleh browser tanpa bundler, tidak di-bundle */
const BGM_URL = '/bgm.mp3';

let audioEl: HTMLAudioElement | null = null;
let isInisialized = false;

function getAudioEl(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio(BGM_URL);
    audioEl.loop = true;
    audioEl.volume = VOLUME_BGM;
    audioEl.preload = 'none'; // Tidak preload - hemat bandwidth & memori
  }
  return audioEl;
}

export function isMusikLatarAktif(): boolean {
  return getPreferensiOrangTua().musikAktif;
}

/**
 * Inisialisasi setelah gesture pertama pengguna.
 * Dipanggil dari unlockAudio() setelah AudioContext berhasil dibuka.
 */
export function inisialisasiMusikLatar(): void {
  if (isInisialized) return;
  isInisialized = true;
  if (isMusikLatarAktif()) {
    getAudioEl().play().catch(() => {});
  }
}

export function setMusikLatarAktif(aktif: boolean): void {
  simpanPreferensiOrangTua({ musikAktif: aktif });
  const el = getAudioEl();
  if (aktif) {
    el.play().catch(() => {});
  } else {
    el.pause();
  }
}

export function toggleMusikLatar(): boolean {
  const baru = !isMusikLatarAktif();
  setMusikLatarAktif(baru);
  return baru;
}

/** Pause sementara saat narasi instruksi berjalan */
export function pauseMusikLatar(): void {
  audioEl?.pause();
}

/** Resume setelah narasi instruksi selesai */
export function resumeMusikLatar(): void {
  if (isMusikLatarAktif() && isInisialized) {
    audioEl?.play().catch(() => {});
  }
}
