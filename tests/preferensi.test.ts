import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPreferensiOrangTua,
  simpanPreferensiOrangTua,
  KUNCI_STORAGE_PREFERENSI,
  PREFERENSI_DEFAULT,
} from '../src/preferensi';

describe('Verifikasi Modul Preferensi (5.1c)', () => {
  beforeEach(() => {
    // Reset state sebelum tiap test
    simpanPreferensiOrangTua({ audioInstruksiAktif: true });
  });

  it('memakai kunci tunggal prefOrtu', () => {
    expect(KUNCI_STORAGE_PREFERENSI).toBe('prefOrtu');
  });

  it('menyediakan nilai default audioInstruksiAktif: true', () => {
    expect(PREFERENSI_DEFAULT.audioInstruksiAktif).toBe(true);
    expect(getPreferensiOrangTua().audioInstruksiAktif).toBe(true);
  });

  it('dapat memperbarui preferensi secara reaktif', () => {
    simpanPreferensiOrangTua({ audioInstruksiAktif: false });
    expect(getPreferensiOrangTua().audioInstruksiAktif).toBe(false);

    simpanPreferensiOrangTua({ audioInstruksiAktif: true });
    expect(getPreferensiOrangTua().audioInstruksiAktif).toBe(true);
  });
});
