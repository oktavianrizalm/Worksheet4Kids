/**
 * Manifest Audio Instruksi Orang Tua untuk 12 Latihan.
 * Skema penamaan berkas: <id-latihan>.<varian>.<ext>
 * Contoh: cocokkan-warna.default.mp3, besar-kecil.besar.mp3
 */

export interface AudioInstructionEntry {
  readonly audioId: string;
  readonly idLatihan: string;
  readonly varian: string;
  readonly teksInstruksi: string;
  readonly namaBerkas: string;
  readonly tahap: 3 | 4 | 5;
}

export const AUDIO_MANIFEST: readonly AudioInstructionEntry[] = [
  // ==========================================
  // TAHAP 3: 5 Latihan Tekan-Pilih Pertama
  // ==========================================
  {
    audioId: 'cocokkan-warna.default',
    idLatihan: 'cocokkan-warna',
    varian: 'default',
    teksInstruksi: 'Cari dan tekan gambar yang warnanya sama.',
    namaBerkas: 'cocokkan-warna.default.mp3',
    tahap: 3,
  },
  {
    audioId: 'cocokkan-bentuk.default',
    idLatihan: 'cocokkan-bentuk',
    varian: 'default',
    teksInstruksi: 'Cari dan tekan bentuk yang sama.',
    namaBerkas: 'cocokkan-bentuk.default.mp3',
    tahap: 3,
  },
  {
    audioId: 'cari-sama.default',
    idLatihan: 'cari-sama',
    varian: 'default',
    teksInstruksi: 'Lihat contoh di atas, lalu tekan gambar yang sama.',
    namaBerkas: 'cari-sama.default.mp3',
    tahap: 3,
  },
  {
    audioId: 'cari-beda.default',
    idLatihan: 'cari-beda',
    varian: 'default',
    teksInstruksi: 'Cari satu gambar yang berbeda sendiri.',
    namaBerkas: 'cari-beda.default.mp3',
    tahap: 3,
  },
  {
    audioId: 'besar-kecil.besar',
    idLatihan: 'besar-kecil',
    varian: 'besar',
    teksInstruksi: 'Tekan gambar yang lebih besar.',
    namaBerkas: 'besar-kecil.besar.mp3',
    tahap: 3,
  },
  {
    audioId: 'besar-kecil.kecil',
    idLatihan: 'besar-kecil',
    varian: 'kecil',
    teksInstruksi: 'Tekan gambar yang lebih kecil.',
    namaBerkas: 'besar-kecil.kecil.mp3',
    tahap: 3,
  },

  // ==========================================
  // TAHAP 4: 5 Latihan Tekan-Pilih Kedua
  // ==========================================
  {
    audioId: 'cocokkan-bayangan.default',
    idLatihan: 'cocokkan-bayangan',
    varian: 'default',
    teksInstruksi: 'Cocokkan gambar berwarna dengan bayangannya.',
    namaBerkas: 'cocokkan-bayangan.default.mp3',
    tahap: 4,
  },
  {
    audioId: 'lanjutkan-pola.default',
    idLatihan: 'lanjutkan-pola',
    varian: 'default',
    teksInstruksi: 'Pilih gambar yang tepat untuk melanjutkan pola.',
    namaBerkas: 'lanjutkan-pola.default.mp3',
    tahap: 4,
  },
  {
    audioId: 'cari-pasangannya.default',
    idLatihan: 'cari-pasangannya',
    varian: 'default',
    teksInstruksi: 'Cari dua gambar yang sama persis.',
    namaBerkas: 'cari-pasangannya.default.mp3',
    tahap: 4,
  },
  {
    audioId: 'hitung-gambarnya.default',
    idLatihan: 'hitung-gambarnya',
    varian: 'default',
    teksInstruksi: 'Hitung jumlah gambarnya, lalu tekan angka yang sesuai.',
    namaBerkas: 'hitung-gambarnya.default.mp3',
    tahap: 4,
  },
  {
    audioId: 'hitung-gambarnya.satu',
    idLatihan: 'hitung-gambarnya',
    varian: 'satu',
    teksInstruksi: 'Hitung jumlah gambarnya: satu.',
    namaBerkas: 'hitung-gambarnya.satu.mp3',
    tahap: 4,
  },
  {
    audioId: 'hitung-gambarnya.dua',
    idLatihan: 'hitung-gambarnya',
    varian: 'dua',
    teksInstruksi: 'Hitung jumlah gambarnya: dua.',
    namaBerkas: 'hitung-gambarnya.dua.mp3',
    tahap: 4,
  },
  {
    audioId: 'hitung-gambarnya.tiga',
    idLatihan: 'hitung-gambarnya',
    varian: 'tiga',
    teksInstruksi: 'Hitung jumlah gambarnya: tiga.',
    namaBerkas: 'hitung-gambarnya.tiga.mp3',
    tahap: 4,
  },
  {
    audioId: 'lingkari-semua-yang-sama.default',
    idLatihan: 'lingkari-semua-yang-sama',
    varian: 'default',
    teksInstruksi: 'Temukan semua gambar yang sama dengan contoh.',
    namaBerkas: 'lingkari-semua-yang-sama.default.mp3',
    tahap: 4,
  },

  // ==========================================
  // TAHAP 5: 2 Latihan Gerak Jari
  // ==========================================
  {
    audioId: 'ikuti-garis.default',
    idLatihan: 'ikuti-garis',
    varian: 'default',
    teksInstruksi: 'Telusuri garis dengan jarimu dari titik awal sampai ke tujuan.',
    namaBerkas: 'ikuti-garis.default.mp3',
    tahap: 5,
  },
  {
    audioId: 'warnai-seperti-contoh.default',
    idLatihan: 'warnai-seperti-contoh',
    varian: 'default',
    teksInstruksi: 'Pilih warna dari palet, lalu sentuh gambar untuk mewarnainya.',
    namaBerkas: 'warnai-seperti-contoh.default.mp3',
    tahap: 5,
  },
] as const;

export function cariManifestAudio(audioId: string): AudioInstructionEntry | undefined {
  return AUDIO_MANIFEST.find((entry) => entry.audioId === audioId);
}

export type VarianAudio = (typeof AUDIO_MANIFEST)[number]['varian'];
export type AudioId = (typeof AUDIO_MANIFEST)[number]['audioId'];

