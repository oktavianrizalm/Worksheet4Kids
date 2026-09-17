import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { GRAPHIC_OBJECTS } from '../../graphics/objects';
import { ObjectId } from '../../graphics/types';
import { VarianAudio, AudioId } from '../../audio/manifest';

const SEMUA_OBJEK = Object.keys(GRAPHIC_OBJECTS) as ObjectId[];

const VARIAN_HITUNG: Record<number, VarianAudio> = {
  1: 'satu',
  2: 'dua',
  3: 'tiga',
};

const TEKS_HITUNG: Record<number, string> = {
  1: 'Hitung jumlah gambarnya: satu.',
  2: 'Hitung jumlah gambarnya: dua.',
  3: 'Hitung jumlah gambarnya: tiga.',
};

/**
 * Generator Latihan #9: Hitung Gambarnya
 * - Menampilkan 1 hingga 3 buah objek di area contoh/pameran.
 * - Pilihan berupa 3 tombol angka chunky (1, 2, 3).
 * - Mengetuk angka yang sesuai dengan jumlah gambar merupakan jawaban benar.
 */
export const generatorHitungGambarnya: GeneratorLatihan = {
  id: 'hitung-gambarnya',
  judul: 'Hitung Gambarnya',
  buatSoal(rng: PRNG): Soal {
    // 1. Tentukan jumlah objek (1, 2, atau 3)
    const jumlah = rng.nextInt(1, 3);
    const varian = VARIAN_HITUNG[jumlah];
    const audioId = `hitung-gambarnya.${varian}` as AudioId;
    const instruksiTeks = TEKS_HITUNG[jumlah];

    // 2. Pilih objek dan warna untuk pameran gambar
    const objek = rng.pick(SEMUA_OBJEK);
    const warna = rng.pick(SEMUA_WARNA_PALET);

    // 3. Bangkitkan 'jumlah' objek pameran di area contoh
    const contoh: readonly Pilihan[] = Array.from({ length: jumlah }, (_, idx) => ({
      id: `contoh-hitung-${idx + 1}`,
      objek,
      warna,
      mode: 'warna',
      skala: 1.0,
      benar: true,
    }));

    // 4. Pilihan berupa 3 tombol angka (1, 2, 3)
    const pilihan: readonly Pilihan[] = [1, 2, 3].map((angka) => ({
      id: `pilihan-angka-${angka}`,
      objek,
      warna: null,
      mode: 'warna',
      skala: 1.0,
      benar: angka === jumlah,
      labelAngka: angka,
    }));

    return {
      idLatihan: 'hitung-gambarnya',
      varian,
      instruksiTeks,
      audioId,
      jumlahPilihan: 3,
      contoh,
      pilihan,
      objekUtama: objek,
    };
  },
};
