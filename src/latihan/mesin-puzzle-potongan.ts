import { Layar } from '../shell/tipe';
import { SesiLatihan } from './sesi';
import { renderObjek } from '../graphics/render-aman';
import { registerTapTarget } from '../input/touch';
import { siapkanInstruksi, mainkanSukses, getAudioContext } from '../audio/engine';
import { DataPuzzle } from './tipe';
import { UKURAN_PAPAN_PUZZLE } from './gen/15-puzzle-potongan';

export interface OpsiMesinPuzzlePotongan {
  sesi: SesiLatihan;
  onKembaliKeBeranda: () => void;
}

/**
 * Memainkan nada klik kayu ceria saat potongan puzzle berhasil terpasang di slotnya.
 */
function mainkanSnap(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.05);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
    console.warn('Gagal memutar audio snap puzzle:', e);
  }
}

/**
 * Mesin Latihan #15: Puzzle Potongan Sederhana (Bongkar Pasang Visual)
 * - Dirancang khusus untuk usia 4-5 tahun.
 * - Mendukung Drag-and-Drop dengan snapping magnetik serta Tap-to-Place ramah motorik balita.
 * - Dilengkapi bantuan visual, umpan balik positif lembut, dan tanpa efek suara salah.
 */
export class MesinPuzzlePotongan implements Layar {
  private host: HTMLElement | null = null;
  private readonly sesi: SesiLatihan;
  private readonly onKembali: () => void;
  private unregisterTargets: Array<() => void> = [];
  private elemenAudioInstruksi: HTMLAudioElement | null = null;

  // Status permainan soal aktif
  private dataPuzzle: DataPuzzle | null = null;
  private statusPotongan: boolean[] = []; // true jika slot sudah terpasang
  private potonganTerpilih: number | null = null; // index slot yang sedang dipilih via tap
  private isCompleted = false;

  constructor(opsi: OpsiMesinPuzzlePotongan) {
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
    this.potonganTerpilih = null;

    const soal = this.sesi.soalSaatIni;
    if (!soal || !soal.dataPuzzle) {
      this.onKembali();
      return;
    }

    this.dataPuzzle = soal.dataPuzzle;
    const { potongan, objek, warna, namaObjek, labelTipe } = this.dataPuzzle;
    this.statusPotongan = new Array(potongan.length).fill(false);

    this.elemenAudioInstruksi = siapkanInstruksi(soal.audioId);

    // Render objek grafis full untuk defs
    const svgObjekFull = renderObjek(objek, warna, 'warna', { size: 200 });

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

    // Acak urutan potongan di baki agar anak menyusun dari potongan acak
    const urutanBaki = [...potongan].sort(() => Math.random() - 0.5);

    // Buat clip-path dan slots untuk papan target
    const defsClipPaths = potongan
      .map(
        (p) => `
        <clipPath id="clip-puzzle-p-${p.slotIndex}">
          <path d="${p.pathClip}" />
        </clipPath>
      `
      )
      .join('\n');

    // Slot placeholder papan target (garis putus-putus)
    const svgSlotsTarget = potongan
      .map(
        (p) => `
        <g id="g-slot-${p.slotIndex}" class="g-slot-target" data-slot="${p.slotIndex}">
          <!-- Garis panduan slot -->
          <path
            d="${p.pathClip}"
            fill="#FFFFFF"
            fill-opacity="0.4"
            stroke="#94A3B8"
            stroke-width="2.5"
            stroke-dasharray="6 6"
            class="slot-border-outline"
          />
          <!-- Konten potongan saat sudah terpasang -->
          <g id="slot-terpasang-${p.slotIndex}" class="slot-konten-terpasang" style="display: none;">
            <use href="#puzzle-objek-penuh" clip-path="url(#clip-puzzle-p-${p.slotIndex})" />
            <path d="${p.pathClip}" fill="none" stroke="#334155" stroke-width="3" />
          </g>
        </g>
      `
      )
      .join('\n');

    // Buat kartu-kartu potongan untuk baki
    let cardW = 118;
    let cardH = 118;
    if (this.dataPuzzle.tipe === '2-potong') {
      cardW = 105;
      cardH = 175;
    } else if (this.dataPuzzle.tipe === '3-potong') {
      cardW = 82;
      cardH = 175;
    }

    const bakiCardsHtml = urutanBaki
      .map((p) => {
        const pad = 6;
        const vx = p.x - pad;
        const vy = p.y - pad;
        const vw = p.w + pad * 2;
        const vh = p.h + pad * 2;

        return `
        <button
          type="button"
          class="kartu-potongan-puzzle"
          id="kartu-potongan-${p.slotIndex}"
          data-slot="${p.slotIndex}"
          style="width: ${cardW}px; height: ${cardH}px;"
          aria-label="Potongan ${p.slotIndex + 1} dari ${namaObjek}"
        >
          <svg viewBox="${vx} ${vy} ${vw} ${vh}" class="svg-potongan-baki">
            <defs>
              <clipPath id="clip-kartu-${p.slotIndex}">
                <path d="${p.pathClip}" />
              </clipPath>
            </defs>
            <g clip-path="url(#clip-kartu-${p.slotIndex})">
              <!-- Render duplikat objek untuk kartu -->
              <rect x="0" y="0" width="${UKURAN_PAPAN_PUZZLE}" height="${UKURAN_PAPAN_PUZZLE}" fill="#FFFFFF" />
              <g transform="translate(18, 18)">
                ${svgObjekFull}
              </g>
            </g>
            <!-- Kontur tepi potongan neobrutalist -->
            <path d="${p.pathClip}" fill="none" stroke="#334155" stroke-width="3.5" stroke-linejoin="round" />
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
          <span aria-hidden="true">🧩</span>
          <span>${soal.instruksiTeks}</span>
          <span class="badge-varian-puzzle">${labelTipe}</span>
        </div>

        <!-- Baris 3: Area Arena Permainan Puzzle -->
        <div class="area-permainan-puzzle">
          <!-- Kolom Kiri: Papan Target Puzzle -->
          <div class="kontainer-papan-puzzle">
            <div class="bingkai-papan-puzzle" id="bingkai-papan-puzzle">
              <svg
                id="svg-papan-puzzle"
                viewBox="0 0 ${UKURAN_PAPAN_PUZZLE} ${UKURAN_PAPAN_PUZZLE}"
                class="svg-papan-kanvas"
              >
                <defs>
                  <clipPath id="clip-papan-bulat">
                    <rect x="0" y="0" width="${UKURAN_PAPAN_PUZZLE}" height="${UKURAN_PAPAN_PUZZLE}" rx="18" />
                  </clipPath>
                  <!-- Simpan definisi objek utama full -->
                  <g id="puzzle-objek-penuh">
                    <rect x="0" y="0" width="${UKURAN_PAPAN_PUZZLE}" height="${UKURAN_PAPAN_PUZZLE}" fill="#FFFFFF" />
                    <g transform="translate(18, 18)">
                      ${svgObjekFull}
                    </g>
                  </g>
                  ${defsClipPaths}
                </defs>

                <!-- Latar dasar papan -->
                <rect
                  x="0"
                  y="0"
                  width="${UKURAN_PAPAN_PUZZLE}"
                  height="${UKURAN_PAPAN_PUZZLE}"
                  rx="18"
                  fill="#F8FAFC"
                  stroke="#334155"
                  stroke-width="5"
                />

                <g clip-path="url(#clip-papan-bulat)">
                  <!-- Gambar bayangan panduan lembut (Ghost Reference) -->
                  <g id="g-bayangan-panduan" opacity="0.22">
                    <use href="#puzzle-objek-penuh" />
                  </g>

                  <!-- Slot-slot target tempat memasang potongan -->
                  ${svgSlotsTarget}

                  <!-- Efek gambar utuh penuh saat selesai -->
                  <g id="g-puzzle-selesai-penuh" style="display: none;" class="anim-pop-scale">
                    <use href="#puzzle-objek-penuh" />
                    <rect
                      x="0"
                      y="0"
                      width="${UKURAN_PAPAN_PUZZLE}"
                      height="${UKURAN_PAPAN_PUZZLE}"
                      rx="18"
                      fill="none"
                      stroke="#10B981"
                      stroke-width="6"
                    />
                  </g>
                </g>
              </svg>
            </div>
            <span class="label-info-papan">Papan Kotak ${namaObjek}</span>
          </div>

          <!-- Kolom Kanan: Baki Potongan Puzzle -->
          <div class="kontainer-baki-puzzle">
            <div class="header-baki-puzzle">
              <span class="judul-baki">Baki Potongan</span>
              <span class="petunjuk-sentuh">Geser atau Tekan Potongan</span>
            </div>
            <div class="grid-baki-potongan" id="grid-baki-potongan">
              ${bakiCardsHtml}
            </div>
          </div>
        </div>

        <!-- Baris 4: Bilah Bawah Permainan -->
        <footer class="latihan-footer-stitch">
          <div class="toast-semangat-stitch">
            <span aria-hidden="true">🌟</span>
            <span>Susun semua potongan sampai gambarnya utuh!</span>
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

    // 1. Pasang tombol kembali
    const btnKembali = this.host.querySelector<HTMLElement>('#btn-kembali-latihan');
    if (btnKembali) {
      const unbind = registerTapTarget(btnKembali, () => {
        this.onKembali();
      });
      this.unregisterTargets.push(unbind);
    }

    // 2. Pasang tombol audio
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

    // 3. Pasang tombol bantuan
    const btnBantuan = this.host.querySelector<HTMLElement>('#btn-bantuan-latihan');
    if (btnBantuan) {
      const unbind = registerTapTarget(btnBantuan, () => {
        putarAudio();
        this.tampilkanBantuan();
      });
      this.unregisterTargets.push(unbind);
    }

    // 4. Pasang tombol lewati
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

    // 5. Inisialisasi Interaksi Puzzle (Drag & Drop + Tap-to-Place)
    this.inisialisasiInteraksiPuzzle();
  }

  private inisialisasiInteraksiPuzzle(): void {
    if (!this.host || !this.dataPuzzle) return;

    const cards = this.host.querySelectorAll<HTMLElement>('.kartu-potongan-puzzle');
    const slots = this.host.querySelectorAll<SVGElement>('.g-slot-target');
    const svgPapan = this.host.querySelector<SVGSVGElement>('#svg-papan-puzzle');

    if (!svgPapan) return;

    // Pasang listener tap pada kartu potongan
    cards.forEach((card) => {
      const slotIndexStr = card.getAttribute('data-slot');
      if (slotIndexStr === null) return;
      const slotIndex = parseInt(slotIndexStr, 10);

      // Listener Drag & Drop berbasis pointer
      this.pasangDragDropKartu(card, slotIndex, svgPapan);

      // Listener Tap-to-Select
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.statusPotongan[slotIndex]) return;

        // Toggle seleksi
        if (this.potonganTerpilih === slotIndex) {
          this.hilangkanSeleksi();
        } else {
          this.pilihPotongan(slotIndex);
        }
      });
    });

    // Pasang listener tap pada slot target di papan
    slots.forEach((slot) => {
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        const slotIdxStr = slot.getAttribute('data-slot');
        if (slotIdxStr === null) return;
        const targetSlot = parseInt(slotIdxStr, 10);

        // Jika ada potongan yang terpilih via tap
        if (this.potonganTerpilih !== null) {
          if (this.potonganTerpilih === targetSlot) {
            // Cocok! Pasang potongan ke slot
            this.pasangPotonganKeSlot(this.potonganTerpilih);
            this.hilangkanSeleksi();
          } else {
            // Animasi goyang lembut jika anak menekan slot yang salah
            slot.classList.add('anim-shake-lembut');
            setTimeout(() => {
              slot.classList.remove('anim-shake-lembut');
            }, 400);
          }
        }
      });
    });

    // Klik di area luar membatalkan seleksi
    this.host.addEventListener('click', () => {
      if (this.potonganTerpilih !== null) {
        this.hilangkanSeleksi();
      }
    });
  }

  private pilihPotongan(slotIndex: number): void {
    this.potonganTerpilih = slotIndex;

    // Reset semua kartu
    const allCards = this.host?.querySelectorAll<HTMLElement>('.kartu-potongan-puzzle');
    allCards?.forEach((c) => c.classList.remove('terpilih'));

    // Highlight kartu terpilih
    const targetCard = this.host?.querySelector<HTMLElement>(`#kartu-potongan-${slotIndex}`);
    targetCard?.classList.add('terpilih');

    // Beri denyut halus pada slot yang bersangkutan di papan
    const targetSlot = this.host?.querySelector<SVGElement>(`#g-slot-${slotIndex}`);
    if (targetSlot) {
      targetSlot.classList.add('slot-menunggu');
    }
  }

  private hilangkanSeleksi(): void {
    this.potonganTerpilih = null;
    const allCards = this.host?.querySelectorAll<HTMLElement>('.kartu-potongan-puzzle');
    allCards?.forEach((c) => c.classList.remove('terpilih'));

    const allSlots = this.host?.querySelectorAll<SVGElement>('.g-slot-target');
    allSlots?.forEach((s) => s.classList.remove('slot-menunggu'));
  }

  private pasangDragDropKartu(
    card: HTMLElement,
    slotIndex: number,
    svgPapan: SVGSVGElement
  ): void {
    let isDragging = false;
    let dragGhost: HTMLElement | null = null;
    let offsetX = 0;
    let offsetY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      if (this.isCompleted || this.statusPotongan[slotIndex]) return;
      if (e.button !== 0) return; // hanya left click / primary touch

      card.setPointerCapture(e.pointerId);
      isDragging = true;

      const rect = card.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      // Buat ghost dragging yang melayang mengikuti jari
      dragGhost = card.cloneNode(true) as HTMLElement;
      dragGhost.classList.add('kartu-drag-melayang');
      dragGhost.style.width = `${rect.width}px`;
      dragGhost.style.height = `${rect.height}px`;
      dragGhost.style.left = `${rect.left}px`;
      dragGhost.style.top = `${rect.top}px`;
      document.body.appendChild(dragGhost);

      card.style.opacity = '0.35';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !dragGhost) return;

      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      dragGhost.style.left = `${x}px`;
      dragGhost.style.top = `${y}px`;

      // Cek apakah mendekati slot target
      const boardRect = svgPapan.getBoundingClientRect();
      const pData = this.dataPuzzle?.potongan[slotIndex];
      if (pData) {
        // Koordinat titik tengah slot di layar
        const scaleX = boardRect.width / UKURAN_PAPAN_PUZZLE;
        const scaleY = boardRect.height / UKURAN_PAPAN_PUZZLE;
        const slotScreenX = boardRect.left + pData.center.x * scaleX;
        const slotScreenY = boardRect.top + pData.center.y * scaleY;

        const ghostCenterX = x + dragGhost.offsetWidth / 2;
        const ghostCenterY = y + dragGhost.offsetHeight / 2;
        const dist = Math.hypot(ghostCenterX - slotScreenX, ghostCenterY - slotScreenY);

        const slotElem = this.host?.querySelector<SVGElement>(`#g-slot-${slotIndex}`);
        if (dist <= 75) {
          slotElem?.classList.add('slot-hover-snap');
        } else {
          slotElem?.classList.remove('slot-hover-snap');
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      card.releasePointerCapture(e.pointerId);

      const slotElem = this.host?.querySelector<SVGElement>(`#g-slot-${slotIndex}`);
      slotElem?.classList.remove('slot-hover-snap');

      if (!dragGhost) return;

      // Cek jarak drop ke titik tengah slot target
      const boardRect = svgPapan.getBoundingClientRect();
      const pData = this.dataPuzzle?.potongan[slotIndex];
      let didSnap = false;

      if (pData) {
        const scaleX = boardRect.width / UKURAN_PAPAN_PUZZLE;
        const scaleY = boardRect.height / UKURAN_PAPAN_PUZZLE;
        const slotScreenX = boardRect.left + pData.center.x * scaleX;
        const slotScreenY = boardRect.top + pData.center.y * scaleY;

        const ghostCenterX = parseFloat(dragGhost.style.left) + dragGhost.offsetWidth / 2;
        const ghostCenterY = parseFloat(dragGhost.style.top) + dragGhost.offsetHeight / 2;
        const dist = Math.hypot(ghostCenterX - slotScreenX, ghostCenterY - slotScreenY);

        // Ambang batas toleransi sentuhan anak (75px)
        if (dist <= 75) {
          didSnap = true;
          this.pasangPotonganKeSlot(slotIndex);
        }
      }

      if (didSnap) {
        dragGhost.remove();
        dragGhost = null;
      } else {
        // Animasi kembali ke baki secara elastis
        const rect = card.getBoundingClientRect();
        dragGhost.style.transition = 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)';
        dragGhost.style.left = `${rect.left}px`;
        dragGhost.style.top = `${rect.top}px`;
        dragGhost.style.transform = 'scale(1)';

        setTimeout(() => {
          dragGhost?.remove();
          dragGhost = null;
          card.style.opacity = '1';
        }, 290);
      }
    };

    card.addEventListener('pointerdown', handlePointerDown);
    card.addEventListener('pointermove', handlePointerMove);
    card.addEventListener('pointerup', handlePointerUp);
    card.addEventListener('pointercancel', handlePointerUp);

    this.unregisterTargets.push(() => {
      card.removeEventListener('pointerdown', handlePointerDown);
      card.removeEventListener('pointermove', handlePointerMove);
      card.removeEventListener('pointerup', handlePointerUp);
      card.removeEventListener('pointercancel', handlePointerUp);
      if (dragGhost) {
        dragGhost.remove();
      }
    });
  }

  private pasangPotonganKeSlot(slotIndex: number): void {
    if (this.statusPotongan[slotIndex]) return;
    this.statusPotongan[slotIndex] = true;

    // 1. Bunyikan efek snap ceria
    mainkanSnap();

    // 2. Tampilkan isi potongan di papan target
    const slotTerpasang = this.host?.querySelector<SVGElement>(`#slot-terpasang-${slotIndex}`);
    if (slotTerpasang) {
      slotTerpasang.style.display = 'inline';
      slotTerpasang.classList.add('anim-pop-scale');
    }

    // Hilangkan outline garis putus-putus
    const slotOutline = this.host?.querySelector<SVGElement>(
      `#g-slot-${slotIndex} .slot-border-outline`
    );
    if (slotOutline) {
      slotOutline.style.stroke = 'none';
      slotOutline.style.fill = 'none';
    }

    // 3. Sembunyikan kartu di baki
    const card = this.host?.querySelector<HTMLElement>(`#kartu-potongan-${slotIndex}`);
    if (card) {
      card.classList.add('kartu-terpasang');
      card.style.pointerEvents = 'none';
    }

    // 4. Periksa apakah seluruh potongan sudah terpasang
    const semuaSelesai = this.statusPotongan.every((status) => status);
    if (semuaSelesai) {
      this.selesaikanPuzzle();
    }
  }

  private tampilkanBantuan(): void {
    // Cari potongan pertama yang belum terpasang
    const unplacedIndex = this.statusPotongan.findIndex((status) => !status);
    if (unplacedIndex === -1) return;

    // Highlight kartu di baki
    this.pilihPotongan(unplacedIndex);

    // Kedipkan slot di papan selama 2 detik
    const slotElem = this.host?.querySelector<SVGElement>(`#g-slot-${unplacedIndex}`);
    if (slotElem) {
      slotElem.classList.add('anim-pulse-bantuan');
      setTimeout(() => {
        slotElem.classList.remove('anim-pulse-bantuan');
      }, 2200);
    }
  }

  private selesaikanPuzzle(): void {
    if (this.isCompleted) return;
    this.isCompleted = true;

    // Tampilkan gambar utuh penuh berkilau
    const fullPuzzle = this.host?.querySelector<SVGElement>('#g-puzzle-selesai-penuh');
    if (fullPuzzle) {
      fullPuzzle.style.display = 'inline';
    }

    // Mainkan audio sukses ceria
    mainkanSukses();

    // Lanjut ke soal berikutnya setelah animasi selebrasi
    setTimeout(() => {
      this.sesi.lanjutSoalBerikutnya();
      if (!this.sesi.apakahSelesai) {
        this.tampilkanSoalAktif();
      }
    }, 1200);
  }
}
