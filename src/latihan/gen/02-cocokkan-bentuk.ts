import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { pilihBerbeda } from '../../random/similarity';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { ShapeId } from '../../graphics/types';

const BENTUK_DASAR: readonly ShapeId[] = [
  'lingkaran',
  'kotak',
  'segitiga',
  'bintang',
  'hati',
  'ketupat',
] as const;

export const generatorCocokkanBentuk: GeneratorLatihan = {
  id: 'cocokkan-bentuk',
  judul: 'Cocokkan Bentuk',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih 4 bentuk berbeda dari 6 bentuk dasar tanpa benturan kemiripan
    const bentukDipilih = pilihBerbeda(BENTUK_DASAR, 4, rng);

    // 2. Satu warna palet yang sama untuk seluruh soal (isolasi variabel bentuk)
    const warnaSama = rng.pick(SEMUA_WARNA_PALET);

    // 3. Tentukan posisi jawaban benar secara acak
    const indeksBenar = rng.nextInt(0, 3);
    const bentukBenar = bentukDipilih[indeksBenar];

    // 4. Buat contoh
    const contoh: readonly Pilihan[] = [
      {
        id: 'contoh-bentuk',
        objek: bentukBenar,
        warna: warnaSama,
        mode: 'warna',
        skala: 1.0,
        benar: true,
      },
    ];

    // 5. Buat 4 pilihan slot
    const pilihan: readonly Pilihan[] = bentukDipilih.map((objek, idx) => ({
      id: `pilihan-bentuk-${idx + 1}`,
      objek,
      warna: warnaSama,
      mode: 'warna',
      skala: 1.0,
      benar: idx === indeksBenar,
    }));

    return {
      idLatihan: 'cocokkan-bentuk',
      varian: 'default',
      instruksiTeks: 'Cari dan tekan bentuk yang sama.',
      audioId: 'cocokkan-bentuk.default',
      jumlahPilihan: 4,
      contoh,
      pilihan,
      objekUtama: bentukBenar,
    };
  },
};
