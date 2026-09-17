import { Layar } from '../shell/tipe';
import { SesiLatihan } from './sesi';
import { renderObjek } from '../graphics/render-aman';
import { registerTapTarget } from '../input/touch';
import { siapkanInstruksi } from '../audio/engine';
import { TOKENS, PaletteColorKey } from '../tokens';
import { SEMUA_WARNA_PALET } from '../random/warna';
import { PengelolaUmpanBalik } from './umpan-balik';

export interface OpsiMesinWarnaiContoh {
  sesi: SesiLatihan;
  onKembaliKeBeranda: () => void;
}

/**
 * Mesin Latihan #12: Warnai Sesuai Contoh
 * - Contoh warna lengkap di sisi kiri.
 * - Kanvas outline di sisi kanan.
 * - Bar 8 palet warna chunky di bagian bawah.
 * - Balita mengetuk warna lalu menyentuh kanvas untuk mewarnai.
 */
export class MesinWarnaiContoh implements Layar {
  private host: HTMLElement | null = null;
  private readonly sesi: SesiLatihan;
  private readonly onKembali: () => void;
  private readonly umpanBalik: PengelolaUmpanBalik;
  private unregisterTargets: Array<() => void> = [];
  private elemenAudioInstruksi: HTMLAudioElement | null = null;

  private warnaTerpilih: PaletteColorKey = 'merah';

  constructor(opsi: OpsiMesinWarnaiContoh) {
    this.sesi = opsi.sesi;
    this.onKembali = opsi.onKembaliKeBeranda;
    this.umpanBalik = new PengelolaUmpanBalik();
  }

  mount(host: HTMLElement): void {
    this.host = host;
    this.tampilkanSoalAktif();
  }

  destroy(): void {
    this.bersihkanListener();
    this.umpanBalik.bukaKunciInput();
    if (this.elemenAudioInstruksi) {
      this.elemenAudioInstruksi.pause();
      this.elemenAudioInstruksi = null;
    }
    if (this.host) {
      this.host.innerHTML = '';
      this.host = null;
    }
  }

  private bersihkanListener(): void {
    for (const unbind of this.unregisterTargets) {
      unbind();
    }
    this.unregisterTargets = [];
  }

  private tampilkanSoalAktif(): void {
    if (!this.host) return;
    this.bersihkanListener();
    this.umpanBalik.bukaKunciInput();

    const soal = this.sesi.soalSaatIni;
    if (!soal || !soal.warnaTarget) {
      this.onKembali();
      return;
    }

    this.elemenAudioInstruksi = siapkanInstruksi(soal.audioId);

    const objek = soal.objekUtama;
    const warnaTarget = soal.warnaTarget;

    // SVG Contoh (Mode Warna Penuh)
    const svgContoh = renderObjek(objek, warnaTarget, 'warna', { size: 140 });

    // SVG Kanvas Awal (Mode Garis Bersih)
    const svgKanvas = renderObjek(objek, 'biru', 'garis', { size: 140 });

    const nomorTantangan = this.sesi.indeksSaatIni + 1;
    const totalTantangan = this.sesi.totalSoal;

    const segmentsHtml = Array.from({ length: totalTantangan }, (_, i) => {
      if (i < this.sesi.indeksSaatIni) {
        return `<span class="progress-segment selesai" title="Selesai"></span>`;
      } else if (i === this.sesi.indeksSaatIni) {
        return `<span class="progress-segment aktif" title="Soal Aktif"></span>`;
      } else {
        return `<span class="progress-segment" title="Soal ${i + 1}"></span>`;
      }
    }).join('');

    this.host.innerHTML = `
      <div class="layar-latihan">
        <!-- Baris 1: Header Bubbly Stitch -->
        <header class="latihan-header-stitch">
          <button id="btn-kembali-latihan" class="btn-latihan-kembali" type="button" aria-label="Kembali ke Menu Utama">
            <span>←</span>
            <span>Kembali</span>
          </button>

          <!-- Pelacak Tantangan -->
          <div class="latihan-progress-tracker" aria-label="Tantangan ${nomorTantangan} dari ${totalTantangan}">
            <div class="progress-tracker-top">
              <span class="progress-tracker-label">Tantangan</span>
              <span class="progress-tracker-badge">${nomorTantangan}/${totalTantangan}</span>
            </div>
            <div class="progress-tracker-segments">
              ${segmentsHtml}
            </div>
          </div>

          <!-- Aksi Audio -->
          <div class="latihan-header-audio-group">
            <button id="btn-audio-instruksi" class="btn-latihan-dengarkan" type="button" aria-label="Dengarkan petunjuk suara">
              <span aria-hidden="true">🔊</span>
              <span>Dengarkan</span>
            </button>
            <button id="btn-audio-replay" class="btn-latihan-replay" type="button" aria-label="Ulangi instruksi suara" title="Ulangi suara">
              🔁
            </button>
          </div>
        </header>

        <!-- Baris 2: Banner Instruksi Melayang -->
        <div class="banner-instruksi-melayang" role="status">
          <span aria-hidden="true">👉</span>
          <span>${soal.instruksiTeks}</span>
        </div>

        <!-- Baris 3: Area Mewarnai -->
        <div class="area-mewarnai">
          <div class="kontainer-kartu-mewarnai">
            <!-- Kartu Contoh -->
            <div class="kartu-mewarnai">
              <span class="kartu-mewarnai-label">Contoh</span>
              <div style="margin-top: 20px;">
                ${svgContoh}
              </div>
            </div>

            <!-- Kartu Kanvas Interaktif -->
            <div id="kartu-kanvas" class="kartu-mewarnai" style="cursor: pointer;">
              <span class="kartu-mewarnai-label">Warnai di Sini</span>
              <div id="wrapper-svg-kanvas" style="margin-top: 20px;">
                ${svgKanvas}
              </div>
            </div>
          </div>

          <!-- Bar Palet Warna -->
          <div class="bar-palet-warna">
            ${SEMUA_WARNA_PALET.map(
              (w) => `
              <button
                class="tombol-palet ${w === this.warnaTerpilih ? 'terpilih' : ''}"
                data-warna="${w}"
                style="background-color: ${TOKENS.palette[w]};"
                aria-label="Pilih warna ${w}"
              ></button>
            `
            ).join('')}
          </div>
        </div>

        <!-- Baris 4: Bilah Bawah Permainan -->
        <footer class="latihan-footer-stitch">
          <div class="toast-semangat-stitch">
            <span aria-hidden="true">🌟</span>
            <span>Pilih warna lalu sentuh gambarnya!</span>
          </div>

          <div class="latihan-footer-actions">
            <button id="btn-bantuan-latihan" class="btn-bantuan-stitch" type="button" aria-label="Bantuan petunjuk">
              <span aria-hidden="true">💡</span>
              <span>Bantuan</span>
            </button>
            <button id="btn-lewati-latihan" class="btn-lewati-stitch" type="button" aria-label="Lewati soal ini">
              <span>Lewati</span>
              <span aria-hidden="true">≫</span>
            </button>
          </div>
        </footer>
      </div>
    `;

    // Pasang tombol kembali
    const btnKembali = this.host.querySelector<HTMLElement>('#btn-kembali-latihan');
    if (btnKembali) {
      const unbind = registerTapTarget(btnKembali, () => {
        this.onKembali();
      });
      this.unregisterTargets.push(unbind);
    }

    // Pasang tombol audio
    const putarAudio = () => {
      if (this.elemenAudioInstruksi) {
        this.elemenAudioInstruksi.currentTime = 0;
        this.elemenAudioInstruksi.play().catch(() => {});
      }
    };
    const btnAudio = this.host.querySelector<HTMLElement>('#btn-audio-instruksi');
    const btnReplay = this.host.querySelector<HTMLElement>('#btn-audio-replay');
    if (btnAudio) {
      const unbind = registerTapTarget(btnAudio, putarAudio);
      this.unregisterTargets.push(unbind);
    }
    if (btnReplay) {
      const unbind = registerTapTarget(btnReplay, putarAudio);
      this.unregisterTargets.push(unbind);
    }

    // Pasang tombol bantuan
    const btnBantuan = this.host.querySelector<HTMLElement>('#btn-bantuan-latihan');
    if (btnBantuan) {
      const unbind = registerTapTarget(btnBantuan, () => {
        putarAudio();
      });
      this.unregisterTargets.push(unbind);
    }

    // Pasang tombol lewati
    const btnLewati = this.host.querySelector<HTMLElement>('#btn-lewati-latihan');
    if (btnLewati) {
      const unbind = registerTapTarget(btnLewati, () => {
        this.sesi.lanjutSoalBerikutnya();
        if (!this.sesi.apakahSelesai) {
          this.tampilkanSoalAktif();
        }
      });
      this.unregisterTargets.push(unbind);
    }

    // Pasang handler tombol palet warna
    const tombolPaletList = this.host.querySelectorAll<HTMLElement>('.tombol-palet');
    tombolPaletList.forEach((btn) => {
      const unbind = registerTapTarget(btn, () => {
        const warna = btn.getAttribute('data-warna') as PaletteColorKey;
        if (warna) {
          this.warnaTerpilih = warna;
          tombolPaletList.forEach((b) => b.classList.remove('terpilih'));
          btn.classList.add('terpilih');
        }
      });
      this.unregisterTargets.push(unbind);
    });

    // Pasang handler sentuhan pada kartu kanvas
    const kartuKanvas = this.host.querySelector<HTMLElement>('#kartu-kanvas');
    if (kartuKanvas) {
      const unbind = registerTapTarget(kartuKanvas, () => {
        this.tanganiMewarnai(kartuKanvas, objek, warnaTarget);
      });
      this.unregisterTargets.push(unbind);
    }
  }

  private tanganiMewarnai(kartuKanvas: HTMLElement, objek: any, warnaTarget: PaletteColorKey): void {
    if (this.umpanBalik.terkunci) return;

    // Render ulang kanvas dengan warna yang dipilih
    const wrapper = this.host?.querySelector<HTMLElement>('#wrapper-svg-kanvas');
    if (wrapper) {
      wrapper.innerHTML = renderObjek(objek, this.warnaTerpilih, 'warna', { size: 140 });
    }

    // Validasi apakah warnanya sesuai contoh
    if (this.warnaTerpilih === warnaTarget) {
      // Benar!
      this.umpanBalik.beriUmpanBalikBenar(kartuKanvas, () => {
        this.sesi.lanjutSoalBerikutnya();
        if (!this.sesi.apakahSelesai) {
          this.tampilkanSoalAktif();
        }
      });
    } else {
      // Warna belum cocok: goyangan lembut tanpa nada negatif
      this.umpanBalik.beriUmpanBalikSalah(kartuKanvas);
    }
  }
}
