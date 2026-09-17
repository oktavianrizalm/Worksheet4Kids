import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { POOL_WARNA_MURNI, pilihBerbeda } from '../../random/similarity';
import { SEMUA_WARNA_PALET } from '../../random/warna';

/**
 * Generator Latihan #7: Lanjutkan Pola (Pola AB AB)
 * - Deret contoh menampilkan 3 elemen berurutan: [A, B, A] dan 1 slot tanda tanya [?].
 * - Balita memilih item berikutnya untuk melengkapi pola (jawaban benar: B).
 * - Dua pilihan (A vs B) berukuran penuh (1x2 grid).
 */
export const generatorLanjutkanPola: GeneratorLatihan = {
  id: 'lanjutkan-pola',
  judul: 'Lanjutkan Pola',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih 2 objek berbeda tanpa benturan kemiripan
    const [objekA, objekB] = pilihBerbeda(POOL_WARNA_MURNI, 2, rng);

    // 2. Pilih 2 warna berbeda untuk memperjelas multimodal visual (bentuk + warna)
    const warnaA = rng.pick(SEMUA_WARNA_PALET);
    const warnaB = rng.pick(SEMUA_WARNA_PALET.filter((w) => w !== warnaA));

    // 3. Bangun deret contoh: A - B - A - ?
    const contoh: readonly Pilihan[] = [
      {
        id: 'pola-1',
        objek: objekA,
        warna: warnaA,
        mode: 'warna',
        skala: 1.0,
        benar: false,
      },
      {
        id: 'pola-2',
        objek: objekB,
        warna: warnaB,
        mode: 'warna',
        skala: 1.0,
        benar: false,
      },
      {
        id: 'pola-3',
        objek: objekA,
        warna: warnaA,
        mode: 'warna',
        skala: 1.0,
        benar: false,
      },
      {
        id: 'pola-placeholder',
        objek: objekB,
        warna: warnaB,
        mode: 'warna',
        skala: 1.0,
        benar: true,
        isPlaceholder: true,
      },
    ];

    // 4. Jawaban benar adalah B yang melanjutkan pola AB AB
    const pilihanA: Pilihan = {
      id: 'pilihan-pola-a',
      objek: objekA,
      warna: warnaA,
      mode: 'warna',
      skala: 1.0,
      benar: false,
    };

    const pilihanB: Pilihan = {
      id: 'pilihan-pola-b',
      objek: objekB,
      warna: warnaB,
      mode: 'warna',
      skala: 1.0,
      benar: true,
    };

    // 5. Acak urutan 2 pilihan
    const pilihan: readonly Pilihan[] =
      rng.nextInt(0, 1) === 0 ? [pilihanA, pilihanB] : [pilihanB, pilihanA];

    return {
      idLatihan: 'lanjutkan-pola',
      varian: 'default',
      instruksiTeks: 'Pilih gambar yang tepat untuk melanjutkan pola.',
      audioId: 'lanjutkan-pola.default',
      jumlahPilihan: 2,
      contoh,
      pilihan,
      objekUtama: objekB,
    };
  },
};
