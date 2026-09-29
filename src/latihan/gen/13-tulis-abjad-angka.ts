import { GeneratorLatihan, Soal, JalurGaris } from '../tipe';
import { PRNG } from '../../random/prng';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { ObjectId } from '../../graphics/types';

export interface KarakterTracingDef {
  readonly karakter: string;
  readonly jenis: 'abjad' | 'angka';
  readonly label: string;
  readonly d: string;
  readonly titikAwal: { x: number; y: number };
  readonly titikAkhir: { x: number; y: number };
  readonly objekTematik: ObjectId;
}

export const DAFTAR_KARAKTER_TRACING: readonly KarakterTracingDef[] = [
  // --- ANGKA (0-9) ---
  {
    karakter: '1',
    jenis: 'angka',
    label: 'Angka 1',
    d: 'M 340 160 L 400 90 L 400 330',
    titikAwal: { x: 340, y: 160 },
    titikAkhir: { x: 400, y: 330 },
    objekTematik: 'apel',
  },
  {
    karakter: '2',
    jenis: 'angka',
    label: 'Angka 2',
    d: 'M 330 150 C 330 85, 470 85, 470 160 C 470 230, 330 330, 330 330 L 470 330',
    titikAwal: { x: 330, y: 150 },
    titikAkhir: { x: 470, y: 330 },
    objekTematik: 'ikan',
  },
  {
    karakter: '3',
    jenis: 'angka',
    label: 'Angka 3',
    d: 'M 330 130 C 360 85, 470 95, 450 175 C 430 205, 390 205, 390 205 C 430 205, 470 215, 450 290 C 430 340, 330 330, 330 290',
    titikAwal: { x: 330, y: 130 },
    titikAkhir: { x: 330, y: 290 },
    objekTematik: 'kupu_kupu',
  },
  {
    karakter: '5',
    jenis: 'angka',
    label: 'Angka 5',
    d: 'M 470 100 L 350 100 L 350 200 C 370 180, 470 185, 470 260 C 470 330, 370 345, 340 310',
    titikAwal: { x: 470, y: 100 },
    titikAkhir: { x: 340, y: 310 },
    objekTematik: 'bintang',
  },
  {
    karakter: '6',
    jenis: 'angka',
    label: 'Angka 6',
    d: 'M 440 105 C 340 160, 325 270, 370 325 C 430 350, 475 310, 465 250 C 450 195, 360 200, 335 260',
    titikAwal: { x: 440, y: 105 },
    titikAkhir: { x: 335, y: 260 },
    objekTematik: 'balon',
  },
  {
    karakter: '7',
    jenis: 'angka',
    label: 'Angka 7',
    d: 'M 330 110 L 470 110 L 370 330',
    titikAwal: { x: 330, y: 110 },
    titikAkhir: { x: 370, y: 330 },
    objekTematik: 'daun',
  },
  {
    karakter: '8',
    jenis: 'angka',
    label: 'Angka 8',
    d: 'M 400 100 C 450 100, 450 160, 400 215 C 345 275, 345 335, 400 335 C 455 335, 455 275, 400 215 C 350 160, 350 100, 400 100',
    titikAwal: { x: 400, y: 100 },
    titikAkhir: { x: 395, y: 100 },
    objekTematik: 'kue',
  },
  {
    karakter: '9',
    jenis: 'angka',
    label: 'Angka 9',
    d: 'M 450 205 C 440 135, 350 135, 350 200 C 350 260, 430 260, 450 205 L 450 310 C 450 340, 390 340, 360 325',
    titikAwal: { x: 450, y: 205 },
    titikAkhir: { x: 360, y: 325 },
    objekTematik: 'bunga',
  },
  {
    karakter: '0',
    jenis: 'angka',
    label: 'Angka 0',
    d: 'M 400 100 C 330 100, 330 330, 400 330 C 470 330, 470 100, 400 100',
    titikAwal: { x: 400, y: 100 },
    titikAkhir: { x: 395, y: 100 },
    objekTematik: 'matahari',
  },

  // --- ABJAD (Huruf) ---
  {
    karakter: 'C',
    jenis: 'abjad',
    label: 'Huruf C',
    d: 'M 470 140 C 370 85, 320 160, 320 220 C 320 280, 370 355, 470 300',
    titikAwal: { x: 470, y: 140 },
    titikAkhir: { x: 470, y: 300 },
    objekTematik: 'perahu',
  },
  {
    karakter: 'S',
    jenis: 'abjad',
    label: 'Huruf S',
    d: 'M 465 145 C 430 95, 340 105, 340 165 C 340 220, 465 235, 465 290 C 465 350, 335 350, 330 295',
    titikAwal: { x: 465, y: 145 },
    titikAkhir: { x: 330, y: 295 },
    objekTematik: 'kunci',
  },
  {
    karakter: 'O',
    jenis: 'abjad',
    label: 'Huruf O',
    d: 'M 400 100 C 320 100, 320 330, 400 330 C 480 330, 480 100, 400 100',
    titikAwal: { x: 400, y: 100 },
    titikAkhir: { x: 395, y: 100 },
    objekTematik: 'bola',
  },
  {
    karakter: 'U',
    jenis: 'abjad',
    label: 'Huruf U',
    d: 'M 340 105 L 340 240 C 340 335, 460 335, 460 240 L 460 105',
    titikAwal: { x: 340, y: 105 },
    titikAkhir: { x: 460, y: 105 },
    objekTematik: 'payung',
  },
  {
    karakter: 'L',
    jenis: 'abjad',
    label: 'Huruf L',
    d: 'M 345 105 L 345 330 L 465 330',
    titikAwal: { x: 345, y: 105 },
    titikAkhir: { x: 465, y: 330 },
    objekTematik: 'rumah',
  },
  {
    karakter: 'V',
    jenis: 'abjad',
    label: 'Huruf V',
    d: 'M 330 110 L 400 335 L 470 110',
    titikAwal: { x: 330, y: 110 },
    titikAkhir: { x: 470, y: 110 },
    objekTematik: 'topi',
  },
  {
    karakter: 'Z',
    jenis: 'abjad',
    label: 'Huruf Z',
    d: 'M 335 110 L 465 110 L 335 330 L 465 330',
    titikAwal: { x: 335, y: 110 },
    titikAkhir: { x: 465, y: 330 },
    objekTematik: 'ketupat',
  },
  {
    karakter: 'W',
    jenis: 'abjad',
    label: 'Huruf W',
    d: 'M 320 110 L 360 330 L 400 200 L 440 330 L 480 110',
    titikAwal: { x: 320, y: 110 },
    titikAkhir: { x: 480, y: 110 },
    objekTematik: 'awan',
  },
  {
    karakter: 'J',
    jenis: 'abjad',
    label: 'Huruf J',
    d: 'M 450 110 L 450 250 C 450 340, 345 340, 345 270',
    titikAwal: { x: 450, y: 110 },
    titikAkhir: { x: 345, y: 270 },
    objekTematik: 'jamur',
  },
  {
    karakter: 'N',
    jenis: 'abjad',
    label: 'Huruf N',
    d: 'M 340 330 L 340 110 L 460 330 L 460 110',
    titikAwal: { x: 340, y: 330 },
    titikAkhir: { x: 460, y: 110 },
    objekTematik: 'pohon',
  },
  {
    karakter: 'M',
    jenis: 'abjad',
    label: 'Huruf M',
    d: 'M 330 330 L 330 110 L 400 240 L 470 110 L 470 330',
    titikAwal: { x: 330, y: 330 },
    titikAkhir: { x: 470, y: 330 },
    objekTematik: 'mobil',
  },
  {
    karakter: 'I',
    jenis: 'abjad',
    label: 'Huruf I',
    d: 'M 400 110 L 400 330',
    titikAwal: { x: 400, y: 110 },
    titikAkhir: { x: 400, y: 330 },
    objekTematik: 'es_krim',
  },
] as const;

/**
 * Generator Latihan #13: Tulis Abjad & Angka (Finger Tracing Huruf & Angka)
 * - Menampilkan garis putus-putus abjad dan angka untuk diikuti jari balita.
 * - Dilengkapi watermark bentuk huruf/angka dan lencana nama karakter.
 */
export const generatorTulisAbjadAngka: GeneratorLatihan = {
  id: 'tulis-abjad-angka',
  judul: 'Tulis Abjad & Angka',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih karakter secara acak dari 21 pilihan abjad & angka
    const target = rng.pick(DAFTAR_KARAKTER_TRACING);

    // 2. Pilih warna cerah untuk jalur jejak jari
    const warnaJalur = rng.pick(SEMUA_WARNA_PALET);

    const jalurGaris: JalurGaris = {
      d: target.d,
      titikAwal: target.titikAwal,
      titikAkhir: target.titikAkhir,
      objekAwal: target.objekTematik,
      objekAkhir: target.objekTematik,
      warnaJalur,
      karakter: target.karakter,
      jenisKarakter: target.jenis,
      labelKarakter: target.label,
    };

    return {
      idLatihan: 'tulis-abjad-angka',
      varian: 'default',
      instruksiTeks: `Telusuri garis ${target.label} ini dengan jarimu dari titik awal!`,
      audioId: 'tulis-abjad-angka.default',
      jumlahPilihan: 0,
      contoh: [],
      pilihan: [],
      objekUtama: target.objekTematik,
      jalurGaris,
    };
  },
};
