import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { POOL_SILUET, pilihBerbeda } from '../../random/similarity';
import { SEMUA_WARNA_PALET } from '../../random/warna';

/**
 * Generator Latihan #6: Cocokkan Bayangan
 * - Objek contoh berupa siluet tegas (mode: 'siluet', warna #22232E) dari POOL_SILUET.
 * - 4 pilihan berwarna dari POOL_SILUET tanpa benturan kelompok kemiripan.
 * - Warna pilihan seragam untuk mengisolasi variabel bentuk siluet.
 */
export const generatorCocokkanBayangan: GeneratorLatihan = {
  id: 'cocokkan-bayangan',
  judul: 'Cocokkan Bayangan',
  buatSoal(rng: PRNG): Soal {
    // 1. Ambil 4 objek dari POOL_SILUET bebas konflik kemiripan
    const objekDipilih = pilihBerbeda(POOL_SILUET, 4, rng);

    // 2. Warna seragam untuk pilihan berwarna
    const warnaPilihan = rng.pick(SEMUA_WARNA_PALET);

    // 3. Tentukan indeks jawaban benar
    const indeksBenar = rng.nextInt(0, 3);
    const objekBenar = objekDipilih[indeksBenar];

    // 4. Contoh adalah siluet hitam dari objek target
    const contoh: readonly Pilihan[] = [
      {
        id: 'contoh-bayangan',
        objek: objekBenar,
        warna: null,
        mode: 'siluet',
        skala: 1.0,
        benar: true,
      },
    ];

    // 5. 4 pilihan dalam mode warna
    const pilihan: readonly Pilihan[] = objekDipilih.map((objek, idx) => ({
      id: `pilihan-bayangan-${idx + 1}`,
      objek,
      warna: warnaPilihan,
      mode: 'warna',
      skala: 1.0,
      benar: idx === indeksBenar,
    }));

    return {
      idLatihan: 'cocokkan-bayangan',
      varian: 'default',
      instruksiTeks: 'Cocokkan gambar berwarna dengan bayangannya.',
      audioId: 'cocokkan-bayangan.default',
      jumlahPilihan: 4,
      contoh,
      pilihan,
      objekUtama: objekBenar,
    };
  },
};
