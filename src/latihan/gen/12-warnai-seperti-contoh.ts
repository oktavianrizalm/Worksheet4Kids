import { GeneratorLatihan, Soal, Pilihan } from '../tipe';
import { PRNG } from '../../random/prng';
import { POOL_GARIS } from '../../random/similarity';
import { SEMUA_WARNA_PALET } from '../../random/warna';

/**
 * Generator Latihan #12: Warnai Seperti Contoh (Coloring Canvas)
 * - Menggunakan objek dari POOL_GARIS (10 bentuk dengan garis luar bersih).
 * - Menampilkan contoh berwarna di sisi kiri/atas dan kanvas garis luar di sisi kanan/bawah.
 * - Balita memilih warna dari 8 tombol palet lalu menyentuh kanvas untuk mewarnai.
 */
export const generatorWarnaiSepertiContoh: GeneratorLatihan = {
  id: 'warnai-seperti-contoh',
  judul: 'Warnai Sesuai Contoh',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih objek dari POOL_GARIS
    const objek = rng.pick(POOL_GARIS);

    // 2. Pilih warna target dari palet 8 warna
    const warnaTarget = rng.pick(SEMUA_WARNA_PALET);

    // 3. Contoh berupa objek mode 'warna'
    const contoh: readonly Pilihan[] = [
      {
        id: 'contoh-mewarnai',
        objek,
        warna: warnaTarget,
        mode: 'warna',
        skala: 1.0,
        benar: true,
      },
    ];

    // 4. Kanvas mewarnai awal berupa objek mode 'garis' (putih bersih)
    const pilihan: readonly Pilihan[] = [
      {
        id: 'kanvas-mewarnai',
        objek,
        warna: null,
        mode: 'garis',
        skala: 1.0,
        benar: true,
      },
    ];

    return {
      idLatihan: 'warnai-seperti-contoh',
      varian: 'default',
      instruksiTeks: 'Pilih warna dari palet, lalu sentuh gambar untuk mewarnainya.',
      audioId: 'warnai-seperti-contoh.default',
      jumlahPilihan: 1,
      contoh,
      pilihan,
      objekUtama: objek,
      warnaTarget,
    };
  },
};
