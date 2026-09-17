import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { pilihBerbeda } from '../../random/similarity';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { GRAPHIC_OBJECTS } from '../../graphics/objects';
import { ObjectId } from '../../graphics/types';

const SEMUA_OBJEK = Object.keys(GRAPHIC_OBJECTS) as ObjectId[];

/**
 * Generator Latihan #8: Cari Pasangannya
 * - Menampilkan 4 kartu pilihan dalam grid 2x2 tanpa contoh.
 * - Terdapat tepat 1 pasang kembar (2 kartu bergambar objek A yang identik)
 *   dan 2 kartu pengecoh (objek B dan C) tanpa benturan kluster kemiripan.
 * - Kedua kartu kembar bernilai `benar: true`. Mengetuk salah satu dari pasangan kembar
 *   merupakan jawaban benar yang memicu umpan balik positif.
 */
export const generatorCariPasangannya: GeneratorLatihan = {
  id: 'cari-pasangannya',
  judul: 'Cari Pasangannya',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih 3 objek berbeda bebas konflik kemiripan: [objekKembar, pengecoh1, pengecoh2]
    const [objekKembar, pengecoh1, pengecoh2] = pilihBerbeda(SEMUA_OBJEK, 3, rng);

    // 2. Satu warna palet seragam untuk seluruh kartu (mengisolasi persepsi bentuk pasangan)
    const warnaSama = rng.pick(SEMUA_WARNA_PALET);

    // 3. Bangkitkan 4 kartu: 2 kartu kembar + 2 pengecoh
    const daftarPilihan: Pilihan[] = [
      {
        id: 'pilihan-pasangan-1',
        objek: objekKembar,
        warna: warnaSama,
        mode: 'warna',
        skala: 1.0,
        benar: true,
      },
      {
        id: 'pilihan-pasangan-2',
        objek: objekKembar,
        warna: warnaSama,
        mode: 'warna',
        skala: 1.0,
        benar: true,
      },
      {
        id: 'pilihan-pasangan-3',
        objek: pengecoh1,
        warna: warnaSama,
        mode: 'warna',
        skala: 1.0,
        benar: false,
      },
      {
        id: 'pilihan-pasangan-4',
        objek: pengecoh2,
        warna: warnaSama,
        mode: 'warna',
        skala: 1.0,
        benar: false,
      },
    ];

    // 4. Acak posisi keempat kartu dengan PRNG
    const pilihanAcak = rng.shuffle(daftarPilihan);

    return {
      idLatihan: 'cari-pasangannya',
      varian: 'default',
      instruksiTeks: 'Cari dua gambar yang sama persis.',
      audioId: 'cari-pasangannya.default',
      jumlahPilihan: 4,
      contoh: [],
      pilihan: pilihanAcak,
      objekUtama: objekKembar,
    };
  },
};
