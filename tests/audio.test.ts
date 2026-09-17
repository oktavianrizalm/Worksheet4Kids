import { describe, it, expect, beforeAll } from 'vitest';
import { siapkanInstruksi } from '../src/audio/engine';

describe('Verifikasi Audio 3.0a, 3.0b, 3.0c', () => {
  beforeAll(() => {
    // Mock minimal HTMLAudioElement untuk runtime Node/Vitest jika belum ada
    if (typeof globalThis.Audio === 'undefined') {
      class MockAudio {
        src: string;
        constructor(src?: string) {
          this.src = src || '';
        }
      }
      globalThis.Audio = MockAudio as unknown as typeof Audio;
    }
  });

  it('3.0b: siapkanInstruksi mengembalikan Audio instance untuk cocokkan-warna.default dan null untuk 5 ID lainnya', () => {
    // 1. Audio yang BERKASNYA ADA (cocokkan-warna.default.mp3)
    const audioAda = siapkanInstruksi('cocokkan-warna.default');
    expect(audioAda).not.toBeNull();
    expect(audioAda).toBeInstanceOf(globalThis.Audio);

    // 2. Kelima audio ID Tahap 3 lainnya yang BERKASNYA BELUM ADA harus mengembalikan NULL
    expect(siapkanInstruksi('cocokkan-bentuk.default')).toBeNull();
    expect(siapkanInstruksi('cari-sama.default')).toBeNull();
    expect(siapkanInstruksi('cari-beda.default')).toBeNull();
    expect(siapkanInstruksi('besar-kecil.besar')).toBeNull();
    expect(siapkanInstruksi('besar-kecil.kecil')).toBeNull();
  });

  it('3.0c: mengembalikan instans cache yang sama (singleton per audioId), bukan instans baru', () => {
    const instans1 = siapkanInstruksi('cocokkan-warna.default');
    const instans2 = siapkanInstruksi('cocokkan-warna.default');
    expect(instans1).toBe(instans2); // Referensi objek identik via cache
  });
});

import { AUDIO_MANIFEST } from '../src/audio/manifest';
import { DAFTAR_LATIHAN } from '../src/latihan/daftar';
import { PRNG } from '../src/random/prng';
import { isAudioInstruksiAktif, setAudioInstruksiAktif } from '../src/audio/engine';

describe('Verifikasi Integritas Audio Manifest (4.0b)', () => {
  it('semua id di manifest cocok regex ^[a-z-]+\\.[a-z]+$', () => {
    const regex = /^[a-z-]+\.[a-z]+$/;
    expect(AUDIO_MANIFEST.length).toBeGreaterThan(0);
    for (const entry of AUDIO_MANIFEST) {
      expect(entry.audioId).toMatch(regex);
    }
  });

  it('daftar 6 id Tahap 3 terdefinisi secara literal dan konsisten', () => {
    const tahap3Ids = [
      'cocokkan-warna.default',
      'cocokkan-bentuk.default',
      'cari-sama.default',
      'cari-beda.default',
      'besar-kecil.besar',
      'besar-kecil.kecil',
    ];
    for (const id of tahap3Ids) {
      const match = AUDIO_MANIFEST.find((e) => e.audioId === id && e.tahap === 3);
      expect(match).toBeDefined();
    }
  });

  it('setiap GeneratorLatihan.buatSoal().audioId ADA di manifest.ts', () => {
    expect(Object.keys(DAFTAR_LATIHAN).length).toBeGreaterThan(0);
    const rng = new PRNG(42);
    for (const [id, generator] of Object.entries(DAFTAR_LATIHAN)) {
      try {
        const soal = generator.buatSoal(rng);
        const match = AUDIO_MANIFEST.find((e) => e.audioId === soal.audioId);
        expect(match).toBeDefined();
      } catch (err: any) {
        // Generator belum diimplementasikan sampai Langkah 8
        if (err.message && err.message.includes('belum diimplementasikan')) {
          continue;
        }
        throw err;
      }
    }
  });

  it('sakelar on/off audio mematikan siapkanInstruksi secara instan (4.0a)', () => {
    expect(isAudioInstruksiAktif()).toBe(true);
    setAudioInstruksiAktif(false);
    expect(siapkanInstruksi('cocokkan-warna.default')).toBeNull();

    setAudioInstruksiAktif(true);
    expect(siapkanInstruksi('cocokkan-warna.default')).not.toBeNull();
  });
});

