import { Layar } from '../shell/tipe';
import { SesiLatihan } from './sesi';
import { registerTapTarget } from '../input/touch';
import { siapkanInstruksi, mainkanSukses } from '../audio/engine';
import { TOKENS } from '../tokens';

export interface OpsiMesinTulisAbjadAngka {
  sesi: SesiLatihan;
  onKembaliKeBeranda: () => void;
}

/**
 * Mesin Latihan #13: Tulis Abjad & Angka (Finger Tracing Huruf & Angka)
 * - Menerima gesture usapan jari balita untuk membentuk huruf atau angka.
 * - Dilengkapi garis panduan tebal berputus-putus, watermark huruf/angka, dan titik penuntun.
 * - Toleransi tracing luas (80px) yang sangat ramah anak usia 3 tahun.
 * - Anti-frustrasi: progres tracing tidak hilang saat jari terangkat.
 */
export class MesinTulisAbjadAngka implements Layar {
  private host: HTMLElement | null = null;
  private readonly sesi: SesiLatihan;
  private readonly onKembali: () => void;
  private unregisterTargets: Array<() => void> = [];
  private elemenAudioInstruksi: HTMLAudioElement | null = null;

  private isTracing = false;
  private isCompleted = false;
  private currentProgress = 0; // 0..1
  private totalPathLength = 0;
  private pathElement: SVGPathElement | null = null;
  private tracedPathElement: SVGPathElement | null = null;
  private beaconElement: SVGCircleElement | null = null;

  constructor(opsi: OpsiMesinTulisAbjadAngka) {
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
    this.isTracing = false;
    this.isCompleted = false;
    this.currentProgress = 0;

    const soal = this.sesi.soalSaatIni;
    if (!soal || !soal.jalurGaris) {
      this.onKembali();
      return;
    }

    this.elemenAudioInstruksi = siapkanInstruksi(soal.audioId);
    const jalur = soal.jalurGaris;
    const warnaHex = TOKENS.palette[jalur.warnaJalur];
    const karakter = jalur.karakter ?? '';
    const labelKarakter = jalur.labelKarakter ?? 'Abjad / Angka';

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

        <!-- Baris 3: Area Tracing Canvas Huruf & Angka -->
        <div class="area-tracing-svg">
          <svg
            id="svg-kanvas-tracing"
            class="kanvas-svg-tracing"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- 1. Watermark Karakter Latar Belakang -->
            <text
              x="400"
              y="255"
              font-size="220"
              font-family="'Nunito', 'Baloo 2', system-ui, sans-serif"
              font-weight="900"
              text-anchor="middle"
              fill="#E2E8F0"
              opacity="0.6"
              style="user-select: none; pointer-events: none;"
            >${karakter}</text>

            <!-- 2. Lencana Karakter di Atas Kanvas -->
            <g transform="translate(400, 44)">
              <rect x="-105" y="-16" width="210" height="32" rx="16" fill="${warnaHex}" opacity="0.18" />
              <text x="0" y="5" font-size="15" font-family="'Nunito', 'Baloo 2', sans-serif" font-weight="900" text-anchor="middle" fill="${warnaHex}">✨ ${labelKarakter}</text>
            </g>

            <!-- 3. Garis Panduan Berputus-putus -->
            <path
              id="path-panduan"
              d="${jalur.d}"
              fill="none"
              stroke="#CBD5E1"
              stroke-width="22"
              stroke-dasharray="12 18"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.85"
            />

            <!-- 4. Jejak Warna Aktif Jari -->
            <path
              id="path-jejak-aktif"
              d="${jalur.d}"
              fill="none"
              stroke="${warnaHex}"
              stroke-width="24"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- 5. Indikator Titik Mulai (Awal) -->
            <g id="g-titik-mulai" transform="translate(${jalur.titikAwal.x}, ${jalur.titikAwal.y})">
              <circle r="22" fill="#10B981" stroke="#FFFFFF" stroke-width="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
              <text y="5" font-size="13" font-family="sans-serif" font-weight="900" fill="#FFFFFF" text-anchor="middle">👆</text>
            </g>

            <!-- 6. Indikator Titik Selesai (Tujuan) -->
            <g id="g-tujuan" transform="translate(${jalur.titikAkhir.x}, ${jalur.titikAkhir.y})">
              <circle r="22" fill="#F59E0B" stroke="#FFFFFF" stroke-width="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
              <text y="5" font-size="13" font-family="sans-serif" font-weight="900" fill="#FFFFFF" text-anchor="middle">⭐️</text>
            </g>

            <!-- 7. Indikator Beacon Penuntun -->
            <circle
              id="beacon-jari"
              cx="${jalur.titikAwal.x}"
              cy="${jalur.titikAwal.y}"
              r="22"
              fill="${warnaHex}"
              stroke="#FFFFFF"
              stroke-width="4"
              opacity="0.95"
            />
          </svg>
        </div>

        <!-- Baris 4: Bilah Bawah Permainan -->
        <footer class="latihan-footer-stitch">
          <div class="toast-semangat-stitch">
            <span aria-hidden="true">🌟</span>
            <span>Ikuti garis abjad/angka perlahan-lahan ya!</span>
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
        if (this.beaconElement) {
          this.beaconElement.classList.add('anim-pulse-contoh');
          setTimeout(() => {
            this.beaconElement?.classList.remove('anim-pulse-contoh');
          }, 1600);
        }
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

    // Inisialisasi Tracing SVG
    const svg = this.host.querySelector<SVGSVGElement>('#svg-kanvas-tracing');
    this.pathElement = this.host.querySelector<SVGPathElement>('#path-panduan');
    this.tracedPathElement = this.host.querySelector<SVGPathElement>('#path-jejak-aktif');
    this.beaconElement = this.host.querySelector<SVGCircleElement>('#beacon-jari');

    if (svg && this.pathElement && this.tracedPathElement) {
      this.totalPathLength = this.pathElement.getTotalLength();
      this.tracedPathElement.style.strokeDasharray = `${this.totalPathLength}`;
      this.tracedPathElement.style.strokeDashoffset = `${this.totalPathLength}`;

      this.pasangGestureTracing(svg);
    }
  }

  private pasangGestureTracing(svg: SVGSVGElement): void {
    const konversiKeSvg = (clientX: number, clientY: number): { x: number; y: number } => {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: clientX, y: clientY };
      const res = pt.matrixTransform(ctm.inverse());
      return { x: res.x, y: res.y };
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (this.isCompleted || !this.pathElement) return;
      if (e.width > TOKENS.touch.maxContactSize || e.height > TOKENS.touch.maxContactSize) {
        return; // Palm rejection
      }

      const touch = konversiKeSvg(e.clientX, e.clientY);
      const currentLength = this.currentProgress * this.totalPathLength;
      const currentPt = this.pathElement.getPointAtLength(currentLength);

      const jarak = Math.hypot(touch.x - currentPt.x, touch.y - currentPt.y);
      if (jarak <= 80) {
        this.isTracing = true;
        try {
          svg.setPointerCapture(e.pointerId);
        } catch {}
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!this.isTracing || this.isCompleted || !this.pathElement || !this.tracedPathElement) return;

      const touch = konversiKeSvg(e.clientX, e.clientY);
      const currentLength = this.currentProgress * this.totalPathLength;

      // Cari titik terdekat ke arah maju di sepanjang kurva
      let bestLength = currentLength;
      let bestDist = Infinity;

      const windowMaju = 70; // Jendela pencarian ke depan
      const step = 4;

      for (let s = currentLength; s <= Math.min(this.totalPathLength, currentLength + windowMaju); s += step) {
        const pt = this.pathElement.getPointAtLength(s);
        const dist = Math.hypot(touch.x - pt.x, touch.y - pt.y);
        if (dist < bestDist) {
          bestDist = dist;
          bestLength = s;
        }
      }

      if (bestDist <= 80 && bestLength > currentLength) {
        this.currentProgress = bestLength / this.totalPathLength;
        const offset = this.totalPathLength * (1 - this.currentProgress);
        this.tracedPathElement.style.strokeDashoffset = `${offset}`;

        const newPt = this.pathElement.getPointAtLength(bestLength);
        if (this.beaconElement) {
          this.beaconElement.setAttribute('cx', `${newPt.x}`);
          this.beaconElement.setAttribute('cy', `${newPt.y}`);
        }

        // Selesai jika sudah mencapai >= 92% jalur
        if (this.currentProgress >= 0.92) {
          this.selesaikanTracing();
        }
      }
    };

    const handlePointerUp = () => {
      this.isTracing = false;
    };

    svg.addEventListener('pointerdown', handlePointerDown);
    svg.addEventListener('pointermove', handlePointerMove);
    svg.addEventListener('pointerup', handlePointerUp);
    svg.addEventListener('pointercancel', handlePointerUp);

    this.unregisterTargets.push(() => {
      svg.removeEventListener('pointerdown', handlePointerDown);
      svg.removeEventListener('pointermove', handlePointerMove);
      svg.removeEventListener('pointerup', handlePointerUp);
      svg.removeEventListener('pointercancel', handlePointerUp);
    });
  }

  private selesaikanTracing(): void {
    if (this.isCompleted) return;
    this.isCompleted = true;
    this.isTracing = false;

    if (this.tracedPathElement) {
      this.tracedPathElement.style.strokeDashoffset = '0';
    }

    if (this.beaconElement) {
      this.beaconElement.style.display = 'none';
    }

    const gTujuan = this.host?.querySelector<SVGGElement>('#g-tujuan');
    if (gTujuan) {
      gTujuan.classList.add('anim-pop-scale');
    }

    const svg = this.host?.querySelector<SVGSVGElement>('#svg-kanvas-tracing');
    if (svg) {
      svg.classList.add('anim-pop-scale');
    }

    mainkanSukses();

    setTimeout(() => {
      this.sesi.lanjutSoalBerikutnya();
      if (!this.sesi.apakahSelesai) {
        this.tampilkanSoalAktif();
      }
    }, 800);
  }
}
