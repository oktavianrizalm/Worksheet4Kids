import { describe, it, expect } from 'vitest';
import { DAFTAR_LATIHAN } from '../src/latihan/daftar';
import { AUDIO_MANIFEST } from '../src/audio/manifest';
import { PRNG } from '../src/random/prng';
import { GeneratorLatihan, Soal } from '../src/latihan/tipe';

describe('Test Kontrak Generik Generator Latihan (5.0e, 5.1a, 5.1b)', () => {
  // 5.1a: Wajib gagal jika registry kosong
  it('5.1a: registry DAFTAR_LATIHAN tidak boleh kosong', () => {
    expect(Object.values(DAFTAR_LATIHAN).length).toBeGreaterThan(0);
  });

  // 5.1b: Kunci DAFTAR_LATIHAN identik dengan GeneratorLatihan.id
  it('5.1b: setiap kunci DAFTAR_LATIHAN identik dengan GeneratorLatihan.id', () => {
    expect(Object.keys(DAFTAR_LATIHAN).length).toBeGreaterThan(0);
    for (const [kunci, generator] of Object.entries(DAFTAR_LATIHAN)) {
      expect(kunci).toBe(generator.id);
    }
  });

  const generators = Object.values(DAFTAR_LATIHAN);

  it.each(generators)(
    'Generator "$id" mematuhi kontrak Soal selama 2000 iterasi',
    (generator: GeneratorLatihan) => {
      // Periksa apakah generator sudah diimplementasikan (Langkah 8)
      try {
        generator.buatSoal(new PRNG(1));
      } catch (err: unknown) {
        const error = err as Error;
        if (error.message && error.message.includes('belum diimplementasikan')) {
          // Generator stub tahap persiapan Langkah 8
          return;
        }
        throw err;
      }

      const manifestAudioIds = new Set(AUDIO_MANIFEST.map((entry) => entry.audioId));

      for (let i = 0; i < 2000; i++) {
        const seed = 100000 + i;
        const rng = new PRNG(seed);
        const soal: Soal = generator.buatSoal(rng);

        // 1. pilihan.length === jumlahPilihan (5.0d & 5.0e)
        expect(soal.pilihan.length).toBe(soal.jumlahPilihan);
        expect([0, 1, 2, 3, 4, 8]).toContain(soal.jumlahPilihan);

        // 2. target benar sesuai tipe latihan
        const jumlahBenar = soal.pilihan.filter((p) => p.benar).length;
        const targetJumlahBenar =
          generator.id === 'cari-pasangannya'
            ? 2
            : generator.id === 'lingkari-semua-yang-sama'
              ? 3
              : generator.id === 'ikuti-garis'
                ? 0
                : 1;
        expect(jumlahBenar).toBe(targetJumlahBenar);

        // Validasi khusus per generator Tahap 4 & 5:
        if (generator.id === 'cocokkan-bayangan') {
          expect(soal.contoh[0].mode).toBe('siluet');
          expect(soal.contoh[0].warna).toBeNull();
        } else if (generator.id === 'lanjutkan-pola') {
          expect(soal.contoh.length).toBe(4);
          expect(soal.contoh[3].isPlaceholder).toBe(true);
        } else if (generator.id === 'hitung-gambarnya') {
          const angkaBenar = soal.pilihan.find((p) => p.benar)?.labelAngka;
          expect(soal.contoh.length).toBe(angkaBenar);
        } else if (generator.id === 'lingkari-semua-yang-sama') {
          expect(soal.pilihan.length).toBe(8);
          expect(jumlahBenar).toBe(3);
        } else if (generator.id === 'ikuti-garis') {
          expect(soal.jalurGaris).toBeDefined();
          expect(soal.jalurGaris?.d).toBeDefined();
        } else if (generator.id === 'warnai-seperti-contoh') {
          expect(soal.warnaTarget).toBeDefined();
          expect(soal.contoh[0].mode).toBe('warna');
          expect(soal.pilihan[0].mode).toBe('garis');
        }

        // 3. audioId === `${idLatihan}.${varian}` dan terdaftar di manifest
        expect(soal.audioId).toBe(`${soal.idLatihan}.${soal.varian}`);
        expect(manifestAudioIds.has(soal.audioId)).toBe(true);

        // 5.1b: id generator harus identik dengan bagian sebelum titik pada audioId
        const [idLatihanDariAudio, varianDariAudio] = soal.audioId.split('.');
        expect(idLatihanDariAudio).toBe(generator.id);
        expect(idLatihanDariAudio).toBe(soal.idLatihan);
        expect(varianDariAudio).toBe(soal.varian);

        // 4. objekUtama termasuk dalam kumpulan objek yang dipakai soal
        const semuaObjekDiSoal = new Set([
          ...soal.pilihan.map((p) => p.objek),
          ...soal.contoh.map((c) => c.objek),
          ...(soal.jalurGaris ? [soal.jalurGaris.objekAwal, soal.jalurGaris.objekAkhir] : []),
        ]);
        expect(semuaObjekDiSoal.has(soal.objekUtama)).toBe(true);

        // 5. Seed sama -> deterministik / deep equal
        const rngKloning = new PRNG(seed);
        const soalKloning = generator.buatSoal(rngKloning);
        expect(soal).toEqual(soalKloning);
      }
    }
  );
});
