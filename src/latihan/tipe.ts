import { ObjectId, RenderMode } from '../graphics/types';
import { PaletteColorKey } from '../tokens';
import { PRNG } from '../random/prng';
import { VarianAudio, AudioId } from '../audio/manifest';

export type { RenderMode, ObjectId, PaletteColorKey, VarianAudio, AudioId };

export interface Pilihan {
  readonly id: string; // unik dalam satu soal
  readonly objek: ObjectId;
  readonly warna: PaletteColorKey | null;
  readonly mode: RenderMode;
  readonly skala: number; // 0..1, relatif terhadap slot
  readonly benar: boolean;
  readonly labelAngka?: number; // Khusus untuk tombol angka (latihan #9)
  readonly isPlaceholder?: boolean; // Khusus untuk slot tanda tanya deret pola (latihan #7)
}

export interface JalurGaris {
  readonly d: string; // Koordinat path SVG
  readonly titikAwal: { x: number; y: number };
  readonly titikAkhir: { x: number; y: number };
  readonly objekAwal: ObjectId;
  readonly objekAkhir: ObjectId;
  readonly warnaJalur: PaletteColorKey;
}

export interface Soal {
  readonly idLatihan: string;
  readonly varian: VarianAudio; // Diketatkan ke union literal dari manifest audio (5.1d)
  readonly instruksiTeks: string;
  readonly audioId: AudioId; // Diketatkan ke union literal dari manifest audio (5.1d)
  readonly jumlahPilihan: 0 | 1 | 2 | 3 | 4 | 8; // 0: ikuti-garis, 1: warnai, 2: besar-kecil/pola, 3: hitung, 4: standar, 8: multi
  readonly contoh: readonly Pilihan[]; // kosong jika tak ada contoh
  readonly pilihan: readonly Pilihan[];
  readonly objekUtama: ObjectId; // untuk aturan anti-ulang antar soal
  readonly jalurGaris?: JalurGaris; // Khusus untuk latihan #11 ikuti garis
  readonly warnaTarget?: PaletteColorKey; // Khusus untuk latihan #12 warnai seperti contoh
}

export interface GeneratorLatihan {
  readonly id: string;
  readonly judul: string;
  buatSoal(rng: PRNG): Soal; // WAJIB fungsi murni terhadap rng
}
