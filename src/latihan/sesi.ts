import { Soal, GeneratorLatihan } from './tipe';
import { PRNG } from '../random/prng';
import { areSimilar } from '../random/similarity';

export interface SesiOptions {
  generator: GeneratorLatihan;
  rng: PRNG;
  onSesiSelesai: () => void;
}

/**
 * State Sesi Latihan:
 * - 3 atau 4 soal per sesi (diacak dari rng sesi).
 * - Anti-ulang: !areSimilar(soal[n].objekUtama, soal[n-1].objekUtama).
 * - Anti-bias posisi: indeks jawaban benar tidak boleh sama 3 kali berturut-turut.
 * - Tanpa skor, tanpa persentase, tanpa timer.
 */
export class SesiLatihan {
  readonly idLatihan: string;
  readonly judul: string;
  private readonly generator: GeneratorLatihan;
  private readonly rng: PRNG;
  private readonly daftarSoal: Soal[] = [];
  private indeksSoalAktif = 0;
  private readonly onSesiSelesai: () => void;

  constructor(options: SesiOptions) {
    this.idLatihan = options.generator.id;
    this.judul = options.generator.judul;
    this.generator = options.generator;
    this.rng = options.rng;
    this.onSesiSelesai = options.onSesiSelesai;

    this.bangkitkanDaftarSoal();
  }

  get totalSoal(): number {
    return this.daftarSoal.length;
  }

  get indeksSaatIni(): number {
    return this.indeksSoalAktif;
  }

  get soalSaatIni(): Soal | null {
    return this.daftarSoal[this.indeksSoalAktif] ?? null;
  }

  get apakahSelesai(): boolean {
    return this.indeksSoalAktif >= this.daftarSoal.length;
  }

  lanjutSoalBerikutnya(): void {
    this.indeksSoalAktif++;
    if (this.apakahSelesai) {
      this.onSesiSelesai();
    }
  }

  private bangkitkanDaftarSoal(): void {
    // Minimal 10 soal per sesi (10 hingga 12 soal acak)
    const jumlahSoal = this.rng.nextInt(10, 12);

    const historyPosisiBenar: number[] = [];

    for (let i = 0; i < jumlahSoal; i++) {
      let percobaan = 0;
      let soalValid: Soal | null = null;

      while (percobaan < 20) {
        percobaan++;
        const kandidat = this.generator.buatSoal(this.rng);

        // 1. Aturan Anti-Ulang: Tidak boleh berada dalam SIMILARITY_CLUSTERS yang sama dengan soal sebelumnya
        if (i > 0) {
          const soalSebelumnya = this.daftarSoal[i - 1];
          if (areSimilar(kandidat.objekUtama, soalSebelumnya.objekUtama)) {
            continue;
          }
        }

        // 2. Aturan Anti-Bias Posisi: Indeks jawaban benar tidak boleh sama 3 kali berturut-turut
        const indeksBenar = kandidat.pilihan.findIndex((p) => p.benar);
        if (
          historyPosisiBenar.length >= 2 &&
          historyPosisiBenar[historyPosisiBenar.length - 1] === indeksBenar &&
          historyPosisiBenar[historyPosisiBenar.length - 2] === indeksBenar
        ) {
          continue;
        }

        soalValid = kandidat;
        historyPosisiBenar.push(indeksBenar);
        break;
      }

      if (!soalValid) {
        // Fallback jika batas 20 percobaan tercapai: terima kandidat terakhir apa adanya
        if (import.meta.env?.DEV) {
          console.warn(
            `[SesiLatihan] Loop anti-ulang mencapai batas 20 percobaan pada soal ke-${i + 1} (${this.idLatihan}). Menerima kandidat apa adanya.`
          );
        }
        soalValid = this.generator.buatSoal(this.rng);
        historyPosisiBenar.push(soalValid.pilihan.findIndex((p) => p.benar));
      }

      this.daftarSoal.push(soalValid);
    }
  }
}
