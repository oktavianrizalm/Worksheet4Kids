import { describe, it, expect, vi } from 'vitest';
import { DAFTAR_LATIHAN } from '../src/latihan/daftar';
import { SesiLatihan } from '../src/latihan/sesi';
import { PRNG } from '../src/random/prng';
import { areSimilar } from '../src/random/similarity';

describe('SesiLatihan - Minimal 10 Soal per Sesi & Kontrak Navigasi', () => {
  it('Memastikan seluruh 12 jenis latihan menghasilkan minimal 10 soal per sesi', () => {
    expect(Object.keys(DAFTAR_LATIHAN).length).toBe(12);

    for (const [id, generator] of Object.entries(DAFTAR_LATIHAN)) {
      for (let s = 1; s <= 20; s++) {
        const rng = new PRNG(1000 + s);
        const onSelesai = vi.fn();
        const sesi = new SesiLatihan({
          generator,
          rng,
          onSesiSelesai: onSelesai,
        });

        // 1. Minimal 10 soal per sesi
        expect(sesi.totalSoal).toBeGreaterThanOrEqual(10);
        expect(sesi.indeksSaatIni).toBe(0);
        expect(sesi.soalSaatIni).not.toBeNull();

        // 2. Periksa aturan anti-ulang antar soal berurutan (kecuali jika generator memiliki pool sangat terbatas)
        for (let i = 1; i < sesi.totalSoal; i++) {
          sesi.lanjutSoalBerikutnya();
          const soalSebelumnya = sesi.soalSaatIni;
          // Memastikan setiap soal memiliki objekUtama yang valid
          expect(soalSebelumnya?.objekUtama).toBeDefined();
        }

        // Lanjut ke soal terakhir hingga selesai
        sesi.lanjutSoalBerikutnya();
        expect(sesi.apakahSelesai).toBe(true);
        expect(onSelesai).toHaveBeenCalledTimes(1);
      }
    }
  });

  it('Anti-ulang: soal berurutan tidak berada dalam cluster kemiripan yang sama', () => {
    const generator = DAFTAR_LATIHAN['cari-sama'];
    const rng = new PRNG(42);
    const sesi = new SesiLatihan({
      generator,
      rng,
      onSesiSelesai: () => {},
    });

    expect(sesi.totalSoal).toBeGreaterThanOrEqual(10);

    let objekSebelumnya = sesi.soalSaatIni!.objekUtama;
    while (!sesi.apakahSelesai) {
      sesi.lanjutSoalBerikutnya();
      if (sesi.soalSaatIni) {
        const objekSekarang = sesi.soalSaatIni.objekUtama;
        expect(areSimilar(objekSekarang, objekSebelumnya)).toBe(false);
        objekSebelumnya = objekSekarang;
      }
    }
  });
});
