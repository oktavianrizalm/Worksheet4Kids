import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { pilihBerbeda } from '../../random/similarity';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { GRAPHIC_OBJECTS } from '../../graphics/objects';
import { ObjectId } from '../../graphics/types';

const SEMUA_OBJEK: readonly ObjectId[] = Object.keys(GRAPHIC_OBJECTS) as ObjectId[];

export const generatorCariBeda: GeneratorLatihan = {
  id: 'cari-beda',
  judul: 'Cari yang Berbeda',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih 2 objek yang tidak sekelompok kemiripan (objekMayoritas vs objekBeda)
    const [objekMayoritas, objekBeda] = pilihBerbeda(SEMUA_OBJEK, 2, rng);

    // 2. Satu warna palet yang sama untuk keempat pilihan
    const warnaSama = rng.pick(SEMUA_WARNA_PALET);

    // 3. Tentukan posisi jawaban benar (objekBeda) secara acak
    const indeksBenar = rng.nextInt(0, 3);

    // 4. Buat 4 pilihan slot: 3x objekMayoritas, 1x objekBeda
    const pilihan: readonly Pilihan[] = [0, 1, 2, 3].map((idx) => {
      const isBenar = idx === indeksBenar;
      return {
        id: `pilihan-beda-${idx + 1}`,
        objek: isBenar ? objekBeda : objekMayoritas,
        warna: warnaSama,
        mode: 'warna',
        skala: 1.0,
        benar: isBenar,
      };
    });

    return {
      idLatihan: 'cari-beda',
      varian: 'default',
      instruksiTeks: 'Cari satu gambar yang berbeda sendiri.',
      audioId: 'cari-beda.default',
      jumlahPilihan: 4,
      contoh: [],
      pilihan,
      objekUtama: objekBeda,
    };
  },
};
