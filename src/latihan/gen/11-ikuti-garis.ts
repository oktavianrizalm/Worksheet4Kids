import { GeneratorLatihan, Soal, JalurGaris } from '../tipe';
import { PRNG } from '../../random/prng';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { ObjectId } from '../../graphics/types';

interface PasanganTematik {
  awal: ObjectId;
  akhir: ObjectId;
}

const PASANGAN_TEMATIK: readonly PasanganTematik[] = [
  { awal: 'mobil', akhir: 'rumah' },
  { awal: 'kupu_kupu', akhir: 'bunga' },
  { awal: 'perahu', akhir: 'ikan' },
  { awal: 'apel', akhir: 'pohon' },
  { awal: 'kunci', akhir: 'rumah' },
  { awal: 'bulan', akhir: 'bintang' },
  { awal: 'balon', akhir: 'awan' },
] as const;

interface DefinisiKurva {
  d: string;
  titikAwal: { x: number; y: number };
  titikAkhir: { x: number; y: number };
}

const VARIASI_KURVA: readonly DefinisiKurva[] = [
  // 1. Gelombang lembut
  {
    d: 'M 100 200 C 250 90, 350 310, 500 200 C 580 120, 640 200, 700 200',
    titikAwal: { x: 100, y: 200 },
    titikAkhir: { x: 700, y: 200 },
  },
  // 2. Lengkungan bukit
  {
    d: 'M 100 260 C 280 110, 520 110, 700 260',
    titikAwal: { x: 100, y: 260 },
    titikAkhir: { x: 700, y: 260 },
  },
  // 3. Lengkungan lembah
  {
    d: 'M 100 140 C 280 290, 520 290, 700 140',
    titikAwal: { x: 100, y: 140 },
    titikAkhir: { x: 700, y: 140 },
  },
  // 4. Gelombang ganda s-curve
  {
    d: 'M 100 200 C 250 110, 350 290, 450 200 C 550 110, 620 290, 700 200',
    titikAwal: { x: 100, y: 200 },
    titikAkhir: { x: 700, y: 200 },
  },
];

/**
 * Generator Latihan #11: Ikuti Garis (Finger Gesture Tracing)
 * - Menghubungkan objek awal (kiri) ke objek tujuan (kanan).
 * - Menghasilkan kurva SVG halus dan toleransi tracing lebar (50-60px).
 */
export const generatorIkutiGaris: GeneratorLatihan = {
  id: 'ikuti-garis',
  judul: 'Ikuti Garis',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih pasangan tematik
    const pasangan = rng.pick(PASANGAN_TEMATIK);

    // 2. Pilih variasi bentuk kurva
    const kurva = rng.pick(VARIASI_KURVA);

    // 3. Pilih warna cerah untuk jalur jejak jari
    const warnaJalur = rng.pick(SEMUA_WARNA_PALET);

    const jalurGaris: JalurGaris = {
      d: kurva.d,
      titikAwal: kurva.titikAwal,
      titikAkhir: kurva.titikAkhir,
      objekAwal: pasangan.awal,
      objekAkhir: pasangan.akhir,
      warnaJalur,
    };

    return {
      idLatihan: 'ikuti-garis',
      varian: 'default',
      instruksiTeks: 'Telusuri garis dengan jarimu dari titik awal sampai ke tujuan.',
      audioId: 'ikuti-garis.default',
      jumlahPilihan: 0,
      contoh: [],
      pilihan: [],
      objekUtama: pasangan.awal,
      jalurGaris,
    };
  },
};
