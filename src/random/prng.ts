/**
 * Generator Bilangan Acak Semu (PRNG) Mulberry32 dengan Seed yang Bisa Disuntik.
 * Menjamin seluruh pengacakan soal dapat direproduksi secara deterministik.
 */

export class PRNG {
  private s: number;

  constructor(seed: number | string = Date.now()) {
    this.s = typeof seed === 'string' ? this.hashString(seed) : (seed >>> 0);
  }

  private hashString(str: string): number {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }

  /**
   * Menghasilkan angka float [0, 1)
   */
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Menghasilkan integer [min, max] inklusif
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Mengacak urutan array tanpa memutasi aslinya
   */
  shuffle<T>(array: readonly T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /**
   * Mengambil 1 elemen acak dari array
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Tidak bisa memilih dari array kosong');
    }
    const idx = Math.floor(this.next() * array.length);
    return array[idx];
  }
}

// Instance default global yang bisa di-reseed kapan saja
export const defaultPrng = new PRNG();
