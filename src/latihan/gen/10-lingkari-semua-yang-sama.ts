import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { pilihBerbeda } from '../../random/similarity';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { GRAPHIC_OBJECTS } from '../../graphics/objects';
import { ObjectId } from '../../graphics/types';

const SEMUA_OBJEK = Object.keys(GRAPHIC_OBJECTS) as ObjectId[];

/**
 * Generator Latihan #10: Lingkari Semua yang Sama
 * - 1 contoh objek target X di area atas.
 * - 8 pilihan di area bawah: tepat 3 target (objek X) dan 5 pengecoh berbeda.
 * - Warna seragam untuk mengisolasi persepsi bentuk.
 * - Balita menyentuh ketiga target satu per satu hingga semuanya terlingkari.
 */
export const generatorLingkariSemuaYangSama: GeneratorLatihan = {
  id: 'lingkari-semua-yang-sama',
  judul: 'Lingkari Semua yang Sama',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih 6 objek bebas konflik kemiripan: [objekTarget, ...5 pengecoh]
    const objekDipilih = pilihBerbeda(SEMUA_OBJEK, 6, rng);
    const objekTarget = objekDipilih[0];
    const pengecoh = objekDipilih.slice(1, 6); // 5 pengecoh

    // 2. Warna palet seragam
    const warna = rng.pick(SEMUA_WARNA_PALET);

    // 3. Contoh di area atas
    const contoh: readonly Pilihan[] = [
      {
        id: 'contoh-lingkari',
        objek: objekTarget,
        warna,
        mode: 'warna',
        skala: 1.0,
        benar: true,
      },
    ];

    // 4. 8 pilihan: 3 target + 5 pengecoh
    const daftarPilihan: Pilihan[] = [
      // 3 buah target
      {
        id: 'pilihan-target-1',
        objek: objekTarget,
        warna,
        mode: 'warna',
        skala: 1.0,
        benar: true,
      },
      {
        id: 'pilihan-target-2',
        objek: objekTarget,
        warna,
        mode: 'warna',
        skala: 1.0,
        benar: true,
      },
      {
        id: 'pilihan-target-3',
        objek: objekTarget,
        warna,
        mode: 'warna',
        skala: 1.0,
        benar: true,
      },
      // 5 buah pengecoh
      ...pengecoh.map((obj, i): Pilihan => ({
        id: `pilihan-pengecoh-${i + 1}`,
        objek: obj,
        warna,
        mode: 'warna',
        skala: 1.0,
        benar: false,
      })),
    ];

    // 5. Acak urutan 8 kartu
    const pilihanAcak = rng.shuffle(daftarPilihan);

    return {
      idLatihan: 'lingkari-semua-yang-sama',
      varian: 'default',
      instruksiTeks: 'Temukan semua gambar yang sama dengan contoh.',
      audioId: 'lingkari-semua-yang-sama.default',
      jumlahPilihan: 8,
      contoh,
      pilihan: pilihanAcak,
      objekUtama: objekTarget,
    };
  },
};
