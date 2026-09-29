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
  readonly karakter?: string; // e.g. "A", "2"
  readonly jenisKarakter?: 'abjad' | 'angka';
  readonly labelKarakter?: string; // e.g. "Huruf A", "Angka 2"
  readonly dindingLabirin?: readonly string[]; // Array d-string dinding labirin (latihan #14)
  readonly jalurPengecoh?: readonly string[]; // Array d-string jalur buntu labirin
}

export interface PotonganPuzzle {
  readonly id: string; // e.g. "p-0"
  readonly slotIndex: number; // 0, 1, 2, 3
  readonly pathClip: string; // SVG path string untuk clipPath dan border potongan
  readonly x: number; // posisi bounding box x
  readonly y: number; // posisi bounding box y
  readonly w: number; // lebar bounding box
  readonly h: number; // tinggi bounding box
  readonly center: { x: number; y: number }; // titik tengah slot untuk snapping
}

export interface DataPuzzle {
  readonly tipe: '2-potong' | '3-potong' | '4-potong';
  readonly labelTipe: string; // "2 Potongan", "3 Potongan", "4 Potongan"
  readonly ukuranPapan: { width: number; height: number }; // 240x240
  readonly potongan: readonly PotonganPuzzle[];
  readonly objek: ObjectId;
  readonly warna: PaletteColorKey;
  readonly namaObjek: string;
}

export interface TitikPotongan {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly namaBagian: string;
}

export interface PilihanBagianHilang {
  readonly id: string;
  readonly objek: ObjectId;
  readonly warna: PaletteColorKey;
  readonly titik: TitikPotongan;
  readonly benar: boolean;
}

export interface DataBagianHilang {
  readonly objek: ObjectId;
  readonly warna: PaletteColorKey;
  readonly titikHilang: TitikPotongan;
  readonly pilihanPotongan: readonly PilihanBagianHilang[];
}

export interface Soal {
  readonly idLatihan: string;
  readonly varian: VarianAudio; // Diketatkan ke union literal dari manifest audio (5.1d)
  readonly instruksiTeks: string;
  readonly audioId: AudioId; // Diketatkan ke union literal dari manifest audio (5.1d)
  readonly jumlahPilihan: 0 | 1 | 2 | 3 | 4 | 8; // 0: ikuti-garis / puzzle, 1: warnai, 2: besar-kecil/pola, 3: hitung, 4: standar, 8: multi
  readonly contoh: readonly Pilihan[]; // kosong jika tak ada contoh
  readonly pilihan: readonly Pilihan[];
  readonly objekUtama: ObjectId; // untuk aturan anti-ulang antar soal
  readonly jalurGaris?: JalurGaris; // Khusus untuk latihan #11 ikuti garis, #13 abjad-angka, #14 labirin
  readonly warnaTarget?: PaletteColorKey; // Khusus untuk latihan #12 warnai seperti contoh
  readonly dataPuzzle?: DataPuzzle; // Khusus untuk latihan #15 puzzle potongan
  readonly dataBagianHilang?: DataBagianHilang; // Khusus untuk latihan #16 bagian yang hilang
}

export interface GeneratorLatihan {
  readonly id: string;
  readonly judul: string;
  buatSoal(rng: PRNG): Soal; // WAJIB fungsi murni terhadap rng
}
