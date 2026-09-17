import { GeneratorLatihan } from './tipe';
import { generatorCocokkanWarna } from './gen/01-cocokkan-warna';
import { generatorCocokkanBentuk } from './gen/02-cocokkan-bentuk';
import { generatorCariSama } from './gen/03-cari-sama';
import { generatorCariBeda } from './gen/04-cari-beda';
import { generatorBesarKecil } from './gen/05-besar-kecil';

import { generatorCocokkanBayangan } from './gen/06-cocokkan-bayangan';
import { generatorLanjutkanPola } from './gen/07-lanjutkan-pola';
import { generatorCariPasangannya } from './gen/08-cari-pasangannya';
import { generatorHitungGambarnya } from './gen/09-hitung-gambarnya';
import { generatorLingkariSemuaYangSama } from './gen/10-lingkari-semua-yang-sama';
import { generatorIkutiGaris } from './gen/11-ikuti-garis';
import { generatorWarnaiSepertiContoh } from './gen/12-warnai-seperti-contoh';

/**
 * Registry Latihan: Seluruh 12 Latihan (#1 s.d. #12)
 */
export const DAFTAR_LATIHAN: Record<string, GeneratorLatihan> = {
  // Tahap 3: 5 Latihan Tekan-Pilih Pertama
  'cocokkan-warna': generatorCocokkanWarna,
  'cocokkan-bentuk': generatorCocokkanBentuk,
  'cari-sama': generatorCariSama,
  'cari-beda': generatorCariBeda,
  'besar-kecil': generatorBesarKecil,

  // Tahap 4: 5 Latihan Tekan-Pilih Kedua
  'cocokkan-bayangan': generatorCocokkanBayangan,
  'lanjutkan-pola': generatorLanjutkanPola,
  'cari-pasangannya': generatorCariPasangannya,
  'hitung-gambarnya': generatorHitungGambarnya,
  'lingkari-semua-yang-sama': generatorLingkariSemuaYangSama,

  // Tahap 5: 2 Latihan Gerak Jari
  'ikuti-garis': generatorIkutiGaris,
  'warnai-seperti-contoh': generatorWarnaiSepertiContoh,
};

export function ambilGeneratorLatihan(id: string): GeneratorLatihan | undefined {
  return DAFTAR_LATIHAN[id];
}
