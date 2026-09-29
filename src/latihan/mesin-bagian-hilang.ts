import { Layar } from '../shell/tipe';
import { SesiLatihan } from './sesi';
import { renderObjek } from '../graphics/render-aman';
import { registerTapTarget } from '../input/touch';
import { siapkanInstruksi, mainkanSukses } from '../audio/engine';
import { DataBagianHilang } from './tipe';
import { UKURAN_PAPAN_BAGIAN_HILANG } from './gen/16-bagian-yang-hilang';

export interface OpsiMesinBagianHilang {
  sesi: SesiLatihan;
  onKembaliKeBeranda: () => void;
}

/**
 * Mesin Latihan #16: Bagian yang Hilang (Find the Missing Piece)
 * - Mengasah persepsi penutupan visual (visual closure) dan ketelitian detail anak 3-5 tahun.
 * - Gambar utama memiliki lubang potongan lingkaran bertanda '?'.
 * - 4 kartu pilihan bulat chunky di bawah: 1 potongan yang tepat dan 3 pengecoh.
 * - Tombol Bantuan (💡) dan tombol Lewati (≫).
 */
export class MesinBagianHilang implements Layar {
  private host: HTMLElement | null = null;
  private readonly sesi: SesiLatihan;
  private readonly onKembali: () => void;
  private unregisterTargets: Array<() => void> = [];
  private elemenAudioInstruksi: HTMLAudioElement | null = null;

  private dataBagianHilang: DataBagianHilang | null = null;
  private isCompleted = false;

  constructor(opsi: OpsiMesinBagianHilang) {
    this.sesi = opsi.sesi;
    this.onKembali = opsi.onKembaliKeBeranda;
  }

  mount(host: HTMLElement): void {
    this.host = host;
    this.tampilkanSoalAktif();
  }

  destroy(): void {
    this.bersihkanListener();
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
    this.isCompleted = false;

    const soal = this.sesi.soalSaatIni;
    if (!soal || !soal.dataBagianHilang) {
      this.onKembali();
      return;
    }

    this.dataBagianHilang = soal.dataBagianHilang;
    const { objek, warna, titikHilang, pilihanPotongan } = this.dataBagianHilang;

    this.elemenAudioInstruksi = siapkanInstruksi(soal.audioId);

    const svgObjekUtama = renderObjek(objek, warna, 'warna', { size: 200 });

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

    // Buat HTML 4 kartu pilihan bulat
    const pilihanHtml = pilihanPotongan
      .map((p, idx) => {
        const svgObjekPilihan = renderObjek(p.objek, p.warna, 'warna', { size: 200 });
        const { x, y, r } = p.titik;
        const vx = x - r;
        const vy = y - r;
        const vw = r * 2;
        const vh = r * 2;

        return `
        <button
          type="button"
          class="kartu-pilihan-bagian"
          id="btn-pilihan-bagian-${idx}"
          data-index="${idx}"
          data-benar="${p.benar}"
          aria-label="Pilihan potongan ${idx + 1}"
        >
          <svg viewBox="${vx} ${vy} ${vw} ${vh}" class="svg-patch-bulat">
            <defs>
              <clipPath id="clip-patch-${idx}">
                <circle cx="${x}" cy="${y}" r="${r}" />
              </clipPath>
            </defs>
            <g clip-path="url(#clip-patch-${idx})">
              <rect x="0" y="0" width="${UKURAN_PAPAN_BAGIAN_HILANG}" height="${UKURAN_PAPAN_BAGIAN_HILANG}" fill="#FFFFFF" />
              <g transform="translate(20, 20)">
                ${svgObjekPilihan}
              </g>
            </g>
            <circle cx="${x}" cy="${y}" r="${r - 1.5}" fill="none" stroke="#334155" stroke-width="3.5" />
          </svg>
        </button>
      `;
      })
      .join('\n');

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
          <span aria-hidden="true">🔍</span>
          <span>${soal.instruksiTeks}</span>
        </div>

        <!-- Baris 3: Area Arena Permainan Bagian Hilang -->
        <div class="area-bagian-hilang">
          <!-- Gambar Utama dengan Lubang Potongan -->
          <div class="bingkai-gambar-utama" id="bingkai-gambar-utama">
            <svg
              id="svg-gambar-utama"
              viewBox="0 0 ${UKURAN_PAPAN_BAGIAN_HILANG} ${UKURAN_PAPAN_BAGIAN_HILANG}"
              class="svg-gambar-papan"
            >
              <defs>
                <clipPath id="clip-frame-bulat">
                  <rect x="0" y="0" width="${UKURAN_PAPAN_BAGIAN_HILANG}" height="${UKURAN_PAPAN_BAGIAN_HILANG}" rx="20" />
                </clipPath>
              </defs>

              <g clip-path="url(#clip-frame-bulat)">
                <!-- Latar gambar -->
                <rect x="0" y="0" width="${UKURAN_PAPAN_BAGIAN_HILANG}" height="${UKURAN_PAPAN_BAGIAN_HILANG}" fill="#FFFFFF" />

                <!-- Objek gambar utama -->
                <g transform="translate(20, 20)">
                  ${svgObjekUtama}
                </g>

                <!-- Lubang Potongan Kosong dengan Tanda Tanya -->
                <g id="g-lubang-potongan" class="g-lubang-potongan">
                  <!-- Lingkaran penutup berlatar abu-abu muda -->
                  <circle
                    cx="${titikHilang.x}"
                    cy="${titikHilang.y}"
                    r="${titikHilang.r}"
                    fill="#F1F5F9"
                    stroke="#64748B"
                    stroke-width="3"
                    stroke-dasharray="6 6"
                  />
                  <!-- Tanda tanya lembut di tengah lubang -->
                  <text
                    x="${titikHilang.x}"
                    y="${titikHilang.y + 10}"
                    font-size="28"
                    font-family="'Nunito', 'Baloo 2', sans-serif"
                    font-weight="900"
                    fill="#94A3B8"
                    text-anchor="middle"
                  >?</text>
                </g>

                <!-- Efek Potongan Terpasang Penuh -->
                <g id="g-potongan-terpasang" style="display: none;">
                  <circle
                    cx="${titikHilang.x}"
                    cy="${titikHilang.y}"
                    r="${titikHilang.r}"
                    fill="none"
                    stroke="#10B981"
                    stroke-width="4.5"
                    class="anim-pop-scale"
                  />
                </g>
              </g>

              <!-- Border luar neobrutalist -->
              <rect
                x="0"
                y="0"
                width="${UKURAN_PAPAN_BAGIAN_HILANG}"
                height="${UKURAN_PAPAN_BAGIAN_HILANG}"
                rx="20"
                fill="none"
                stroke="#334155"
                stroke-width="5"
              />
            </svg>
          </div>

          <!-- Pilihan Potongan Bulat di Bawah -->
          <div class="kontainer-pilihan-bagian">
            <div class="label-pilihan-bawah">Pilih Potongan yang Tepat:</div>
            <div class="baris-kartu-pilihan-bagian" id="baris-kartu-pilihan">
              ${pilihanHtml}
            </div>
          </div>
        </div>

        <!-- Baris 4: Bilah Bawah Permainan -->
        <footer class="latihan-footer-stitch">
          <div class="toast-semangat-stitch">
            <span aria-hidden="true">🌟</span>
            <span>Perhatikan warna dan bentuk detailnya ya!</span>
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
        this.tampilkanBantuan();
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

    // Pasang listener pilihan potongan
    const tombolPilihan = this.host.querySelectorAll<HTMLElement>('.kartu-pilihan-bagian');
    tombolPilihan.forEach((btn) => {
      const unbind = registerTapTarget(btn, () => {
        this.tanganiPilihan(btn);
      });
      this.unregisterTargets.push(unbind);
    });
  }

  private tanganiPilihan(btn: HTMLElement): void {
    if (this.isCompleted) return;

    const isBenar = btn.getAttribute('data-benar') === 'true';

    if (isBenar) {
      this.isCompleted = true;

      // 1. Highlight tombol pilihan yang benar
      btn.classList.add('pilihan-benar-sukses');

      // 2. Buka lubang potongan sehingga gambar menjadi utuh sempurna
      const lubang = this.host?.querySelector<SVGElement>('#g-lubang-potongan');
      if (lubang) {
        lubang.style.display = 'none';
      }

      // Tampilkan ring hijau meriah di sekitar potongan yang terpasang
      const ringTerpasang = this.host?.querySelector<SVGElement>('#g-potongan-terpasang');
      if (ringTerpasang) {
        ringTerpasang.style.display = 'inline';
      }

      // 3. Animasi membal meriah pada seluruh bingkai gambar utama
      const bingkai = this.host?.querySelector<HTMLElement>('#bingkai-gambar-utama');
      if (bingkai) {
        bingkai.classList.add('anim-pop-scale');
      }

      // 4. Mainkan suara sukses ceria
      mainkanSukses();

      // 5. Lanjut ke soal berikutnya
      setTimeout(() => {
        this.sesi.lanjutSoalBerikutnya();
        if (!this.sesi.apakahSelesai) {
          this.tampilkanSoalAktif();
        }
      }, 1100);
    } else {
      // Jawaban salah: Goyangan lembut tanpa suara menghakimi
      btn.classList.add('anim-shake-lembut');
      btn.style.opacity = '0.5';
      setTimeout(() => {
        btn.classList.remove('anim-shake-lembut');
      }, 400);
    }
  }

  private tampilkanBantuan(): void {
    const btnBenar = this.host?.querySelector<HTMLElement>('.kartu-pilihan-bagian[data-benar="true"]');
    if (btnBenar) {
      btnBenar.classList.add('bantuan-highlight-pulse');
      setTimeout(() => {
        btnBenar.classList.remove('bantuan-highlight-pulse');
      }, 2200);
    }

    // Beri kedipan lembut pada lubang potongan
    const lubang = this.host?.querySelector<SVGElement>('#g-lubang-potongan');
    if (lubang) {
      lubang.classList.add('anim-pulse-bantuan');
      setTimeout(() => {
        lubang.classList.remove('anim-pulse-bantuan');
      }, 2200);
    }
  }
}
