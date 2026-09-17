import { PaletteColorKey } from '../tokens';
import { PRNG } from './prng';

export const HUE_TABLE: Record<PaletteColorKey, number> = {
  merah: 1,
  oranye: 30,
  kuning: 44,
  hijau: 120,
  tosca: 178,
  biru: 210,
  ungu: 277,
  pink: 335,
};

export const MIN_HUE_DISTANCE = 40;

export const SEMUA_WARNA_PALET: readonly PaletteColorKey[] = [
  'merah',
  'oranye',
  'kuning',
  'hijau',
  'biru',
  'ungu',
  'pink',
  'tosca',
] as const;

/**
 * Menghitung jarak melingkar pada roda warna (0 - 360 derajat)
 */
export function jarakHue(c1: PaletteColorKey, c2: PaletteColorKey): number {
  const d = Math.abs(HUE_TABLE[c1] - HUE_TABLE[c2]);
  return Math.min(d, 360 - d);
}

/**
 * Memvalidasi apakah suatu set warna mematuhi aturan:
 * 1. Jarak hue antar setiap pasangan >= 40 derajat
 * 2. Tidak pernah memuat merah dan hijau bersamaan (protan/deutan)
 */
export function isKombinasiWarnaValid(warna: readonly PaletteColorKey[]): boolean {
  if (warna.includes('merah') && warna.includes('hijau')) {
    return false;
  }
  for (let i = 0; i < warna.length; i++) {
    for (let j = i + 1; j < warna.length; j++) {
      if (jarakHue(warna[i], warna[j]) < MIN_HUE_DISTANCE) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Tepat 18 kombinasi 4 warna dari palet 8 yang valid secara matematis
 * mematuhi jarak hue >= 40 derajat dan bebas konflik merah-hijau.
 */
export const SET_WARNA_VALID_COCOKKAN: readonly (readonly PaletteColorKey[])[] = [
  ['merah', 'kuning', 'tosca', 'ungu'],
  ['merah', 'kuning', 'biru', 'ungu'],
  ['oranye', 'hijau', 'tosca', 'ungu'],
  ['oranye', 'hijau', 'tosca', 'pink'],
  ['oranye', 'hijau', 'biru', 'ungu'],
  ['oranye', 'hijau', 'biru', 'pink'],
  ['oranye', 'hijau', 'ungu', 'pink'],
  ['oranye', 'tosca', 'ungu', 'pink'],
  ['oranye', 'biru', 'ungu', 'pink'],
  ['kuning', 'hijau', 'tosca', 'ungu'],
  ['kuning', 'hijau', 'tosca', 'pink'],
  ['kuning', 'hijau', 'biru', 'ungu'],
  ['kuning', 'hijau', 'biru', 'pink'],
  ['kuning', 'hijau', 'ungu', 'pink'],
  ['kuning', 'tosca', 'ungu', 'pink'],
  ['kuning', 'biru', 'ungu', 'pink'],
  ['hijau', 'tosca', 'ungu', 'pink'],
  ['hijau', 'biru', 'ungu', 'pink'],
] as const;

/**
 * Memilih 4 warna berbeda yang diacak posisinya secara deterministik melalui PRNG
 */
export function pilih4WarnaBerjarak(rng: PRNG): PaletteColorKey[] {
  const chosenSet = rng.pick(SET_WARNA_VALID_COCOKKAN);
  return rng.shuffle(chosenSet);
}
