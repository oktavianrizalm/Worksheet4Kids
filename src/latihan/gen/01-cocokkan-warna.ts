import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { POOL_WARNA_MURNI } from '../../random/similarity';
import { pilih4WarnaBerjarak } from '../../random/warna';

export const generatorCocokkanWarna: GeneratorLatihan = {
  id: 'cocokkan-warna',
  judul: 'Cocokkan Warna',
  buatSoal(rng: PRNG): Soal {
    // 1. Objek: satu objek yang sama dari POOL_WARNA_MURNI
    const objekUtama = rng.pick(POOL_WARNA_MURNI);

    // 2. 4 warna berbeda dengan jarak hue >= 40 derajat dan anti merah-hijau
    const warnaList = pilih4WarnaBerjarak(rng);

    // 3. Tentukan posisi jawaban benar secara acak
    const indeksBenar = rng.nextInt(0, 3);
    const warnaBenar = warnaList[indeksBenar];

    // 4. Buat contoh
    const contoh: readonly Pilihan[] = [
      {
        id: 'contoh-warna',
        objek: objekUtama,
        warna: warnaBenar,
        mode: 'warna',
        skala: 1.0,
        benar: true,
      },
    ];

    // 5. Buat 4 pilihan slot
    const pilihan: readonly Pilihan[] = warnaList.map((warna, idx) => ({
      id: `pilihan-warna-${idx + 1}`,
      objek: objekUtama,
      warna,
      mode: 'warna',
      skala: 1.0,
      benar: idx === indeksBenar,
    }));

    return {
      idLatihan: 'cocokkan-warna',
      varian: 'default',
      instruksiTeks: 'Cari dan tekan gambar yang warnanya sama.',
      audioId: 'cocokkan-warna.default',
      jumlahPilihan: 4,
      contoh,
      pilihan,
      objekUtama,
    };
  },
};
