import { Layar } from '../shell/tipe';
import { SesiLatihan } from './sesi';
import { renderObjek } from '../graphics/render-aman';
import { registerTapTarget } from '../input/touch';
import { siapkanInstruksi, mainkanSukses } from '../audio/engine';
import { TOKENS } from '../tokens';

export interface OpsiMesinIkutiGaris {
  sesi: SesiLatihan;
  onKembaliKeBeranda: () => void;
}

/**
 * Mesin Latihan #11: Ikuti Garis (Finger Tracing)
 * - Menerima gesture sentuhan / usapan jari balita sepanjang kurva vektor.
 * - Toleransi jari lebar (65px) yang ramah motorik balita.
 * - Anti-frustrasi: progres tidak direset saat jari terangkat.
 */
export class MesinIkutiGaris implements Layar {
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

  constructor(opsi: OpsiMesinIkutiGaris) {
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

    const svgObjekAwal = renderObjek(jalur.objekAwal, jalur.warnaJalur, 'warna', { size: 70 });
    const svgObjekAkhir = renderObjek(jalur.objekAkhir, jalur.warnaJalur, 'warna', { size: 70 });

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

        <!-- Baris 3: Area Tracing Canvas -->
        <div class="area-tracing-svg">
          <svg
            id="svg-kanvas-tracing"
            class="kanvas-svg-tracing"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- 1. Garis Panduan (Dotted) -->
            <path
              id="path-panduan"
              d="${jalur.d}"
              fill="none"
              stroke="#CBD5E1"
              stroke-width="14"
              stroke-dasharray="10 14"
              stroke-linecap="round"
              opacity="0.6"
            />

            <!-- 2. Jejak Aktif Jari -->
            <path
              id="path-jejak-aktif"
              d="${jalur.d}"
              fill="none"
              stroke="${warnaHex}"
              stroke-width="18"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- 3. Objek Awal (Kiri) -->
            <g transform="translate(${jalur.titikAwal.x - 35}, ${jalur.titikAwal.y - 35})">
              ${svgObjekAwal}
            </g>

            <!-- 4. Objek Tujuan (Kanan) -->
            <g id="g-tujuan" transform="translate(${jalur.titikAkhir.x - 35}, ${jalur.titikAkhir.y - 35})">
              ${svgObjekAkhir}
            </g>

            <!-- 5. Indikator Beacon Penuntun -->
            <circle
              id="beacon-jari"
              cx="${jalur.titikAwal.x}"
              cy="${jalur.titikAwal.y}"
              r="20"
              fill="${warnaHex}"
              stroke="#1E293B"
              stroke-width="3"
              opacity="0.9"
            />
          </svg>
        </div>

        <!-- Baris 4: Bilah Bawah Permainan -->
        <footer class="latihan-footer-stitch">
          <div class="toast-semangat-stitch">
            <span aria-hidden="true">🌟</span>
            <span>Tarik garis perlahan-lahan ya!</span>
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
      if (jarak <= 75) {
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

      const windowMaju = 65; // Jendela pencarian ke depan
      const step = 4;

      for (let s = currentLength; s <= Math.min(this.totalPathLength, currentLength + windowMaju); s += step) {
        const pt = this.pathElement.getPointAtLength(s);
        const dist = Math.hypot(touch.x - pt.x, touch.y - pt.y);
        if (dist < bestDist) {
          bestDist = dist;
          bestLength = s;
        }
      }

      if (bestDist <= 75 && bestLength > currentLength) {
        this.currentProgress = bestLength / this.totalPathLength;
        const offset = this.totalPathLength * (1 - this.currentProgress);
        this.tracedPathElement.style.strokeDashoffset = `${offset}`;

        const newPt = this.pathElement.getPointAtLength(bestLength);
        if (this.beaconElement) {
          this.beaconElement.setAttribute('cx', `${newPt.x}`);
          this.beaconElement.setAttribute('cy', `${newPt.y}`);
        }

        // Cek jika sudah mencapai tujuan (>= 94% jalur)
        if (this.currentProgress >= 0.94) {
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

    mainkanSukses();

    setTimeout(() => {
      this.sesi.lanjutSoalBerikutnya();
      if (!this.sesi.apakahSelesai) {
        this.tampilkanSoalAktif();
      }
    }, 750);
  }
}
