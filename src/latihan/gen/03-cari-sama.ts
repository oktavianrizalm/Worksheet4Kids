import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { pilihBerbeda } from '../../random/similarity';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { GRAPHIC_OBJECTS } from '../../graphics/objects';
import { ObjectId } from '../../graphics/types';

const SEMUA_OBJEK: readonly ObjectId[] = Object.keys(GRAPHIC_OBJECTS) as ObjectId[];

export const generatorCariSama: GeneratorLatihan = {
  id: 'cari-sama',
  judul: 'Cari yang Sama',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih 4 objek berbeda tanpa konflik kemiripan
    const objekDipilih = pilihBerbeda(SEMUA_OBJEK, 4, rng);

    // 2. Satu warna palet yang sama untuk seluruh soal
    const warnaSama = rng.pick(SEMUA_WARNA_PALET);

    // 3. Tentukan posisi jawaban benar secara acak
    const indeksBenar = rng.nextInt(0, 3);
    const objekBenar = objekDipilih[indeksBenar];

    // 4. Buat contoh
    const contoh: readonly Pilihan[] = [
      {
        id: 'contoh-sama',
        objek: objekBenar,
        warna: warnaSama,
        mode: 'warna',
        skala: 1.0,
        benar: true,
      },
    ];

    // 5. Buat 4 pilihan slot
    const pilihan: readonly Pilihan[] = objekDipilih.map((objek, idx) => ({
      id: `pilihan-sama-${idx + 1}`,
      objek,
      warna: warnaSama,
      mode: 'warna',
      skala: 1.0,
      benar: idx === indeksBenar,
    }));

    return {
      idLatihan: 'cari-sama',
      varian: 'default',
      instruksiTeks: 'Lihat contoh di atas, lalu tekan gambar yang sama.',
      audioId: 'cari-sama.default',
      jumlahPilihan: 4,
      contoh,
      pilihan,
      objekUtama: objekBenar,
    };
  },
};
