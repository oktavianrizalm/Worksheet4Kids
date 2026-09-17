import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { POOL_WARNA_MURNI } from '../../random/similarity';
import { SEMUA_WARNA_PALET } from '../../random/warna';

export const generatorBesarKecil: GeneratorLatihan = {
  id: 'besar-kecil',
  judul: 'Besar & Kecil',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih varian secara acak: 'besar' atau 'kecil'
    const varian = rng.pick(['besar', 'kecil'] as const);
    const audioId = varian === 'besar' ? 'besar-kecil.besar' : 'besar-kecil.kecil';
    const instruksiTeks =
      varian === 'besar'
        ? 'Tekan gambar yang lebih besar.'
        : 'Tekan gambar yang lebih kecil.';

    // 2. Pilih objek dan warna (sama untuk kedua pilihan)
    const objek = rng.pick(POOL_WARNA_MURNI);
    const warna = rng.pick(SEMUA_WARNA_PALET);

    // 3. Tentukan skala: 1.0 vs 0.45 (rasio 2.22x >= 2.0x)
    const skalaBenar = varian === 'besar' ? 1.0 : 0.45;
    const skalaSalah = varian === 'besar' ? 0.45 : 1.0;

    // 4. Acak posisi kiri/kanan (2 pilihan slot)
    const indeksBenar = rng.nextInt(0, 1);

    const pilihan: readonly Pilihan[] = [0, 1].map((idx) => {
      const isBenar = idx === indeksBenar;
      return {
        id: `pilihan-ukuran-${idx + 1}`,
        objek,
        warna,
        mode: 'warna',
        skala: isBenar ? skalaBenar : skalaSalah,
        benar: isBenar,
      };
    });

    return {
      idLatihan: 'besar-kecil',
      varian,
      instruksiTeks,
      audioId,
      jumlahPilihan: 2,
      contoh: [],
      pilihan,
      objekUtama: objek,
    };
  },
};
