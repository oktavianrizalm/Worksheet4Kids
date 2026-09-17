import { Layar } from '../shell/tipe';
import { unlockAudio, isAudioInstruksiAktif, setAudioInstruksiAktif } from '../audio/engine';
import { registerTapTarget } from '../input/touch';
import { renderObjek } from '../graphics/render-aman';
import { ObjectId, RenderMode } from '../graphics/types';
import { PaletteColorKey } from '../tokens';
import { pasangLongPress } from './long-press';

export interface OpsiBeranda {
  onPilihLatihan: (idLatihan: string) => void;
  onBukaAreaOrangTua: () => void;
}

interface KartuLatihanDef {
  readonly id: string;
  readonly nomor: number;
  readonly judul: string;
  readonly tag: string;
  readonly borderColor: string;
  readonly numBg: string;
  readonly tagBg: string;
  readonly tagColor: string;
  readonly objek: ObjectId;
  readonly warna: PaletteColorKey;
  readonly mode: RenderMode;
  readonly aktif: boolean;
}

const DAFTAR_KARTU: readonly KartuLatihanDef[] = [
  // 5 Latihan Tahap 3 (Aktif)
  {
    id: 'cocokkan-warna',
    nomor: 1,
    judul: 'Cocokkan Warna',
    tag: 'Warna Cerah',
    borderColor: '#FDA4AF',
    numBg: '#F43F5E',
    tagBg: '#FFF1F2',
    tagColor: '#E11D48',
    objek: 'balon',
    warna: 'merah',
    mode: 'warna',
    aktif: true,
  },
  {
    id: 'cocokkan-bentuk',
    nomor: 2,
    judul: 'Cocokkan Bentuk',
    tag: 'Geometri Lucu',
    borderColor: '#FCD34D',
    numBg: '#F59E0B',
    tagBg: '#FEF3C7',
    tagColor: '#B45309',
    objek: 'bintang',
    warna: 'kuning',
    mode: 'warna',
    aktif: true,
  },
  {
    id: 'cari-sama',
    nomor: 3,
    judul: 'Cari yang Sama',
    tag: 'Visual Kembar',
    borderColor: '#7DD3FC',
    numBg: '#0284C7',
    tagBg: '#F0F9FF',
    tagColor: '#0369A1',
    objek: 'ikan',
    warna: 'biru',
    mode: 'warna',
    aktif: true,
  },
  {
    id: 'cari-beda',
    nomor: 4,
    judul: 'Cari Berbeda',
    tag: 'Jeli & Teliti',
    borderColor: '#6EE7B7',
    numBg: '#10B981',
    tagBg: '#ECFDF5',
    tagColor: '#047857',
    objek: 'apel',
    warna: 'hijau',
    mode: 'warna',
    aktif: true,
  },
  {
    id: 'besar-kecil',
    nomor: 5,
    judul: 'Besar & Kecil',
    tag: 'Ukuran Objek',
    borderColor: '#D8B4FE',
    numBg: '#A855F7',
    tagBg: '#FAF5FF',
    tagColor: '#7E22CE',
    objek: 'rumah',
    warna: 'ungu',
    mode: 'warna',
    aktif: true,
  },

  // 5 Latihan Tahap 4 (Aktif)
  {
    id: 'cocokkan-bayangan',
    nomor: 6,
    judul: 'Cocokkan Bayangan',
    tag: 'Siluet Tebak',
    borderColor: '#CBD5E1',
    numBg: '#475569',
    tagBg: '#F1F5F9',
    tagColor: '#334155',
    objek: 'ikan',
    warna: 'merah',
    mode: 'siluet',
    aktif: true,
  },
  {
    id: 'lanjutkan-pola',
    nomor: 7,
    judul: 'Lanjutkan Pola',
    tag: 'Urutan Logika',
    borderColor: '#BEF264',
    numBg: '#65A30D',
    tagBg: '#F7FEE7',
    tagColor: '#4D7C0F',
    objek: 'daun',
    warna: 'hijau',
    mode: 'warna',
    aktif: true,
  },
  {
    id: 'cari-pasangannya',
    nomor: 8,
    judul: 'Cari Pasangannya',
    tag: 'Memori Visual',
    borderColor: '#F472B6',
    numBg: '#EC4899',
    tagBg: '#FDF2F8',
    tagColor: '#BE185D',
    objek: 'kupu_kupu',
    warna: 'pink',
    mode: 'warna',
    aktif: true,
  },
  {
    id: 'hitung-gambarnya',
    nomor: 9,
    judul: 'Hitung Gambarnya',
    tag: 'Jumlah 1 - 3',
    borderColor: '#FDE047',
    numBg: '#EAB308',
    tagBg: '#FEFCE8',
    tagColor: '#A16207',
    objek: 'bunga',
    warna: 'kuning',
    mode: 'warna',
    aktif: true,
  },
  {
    id: 'lingkari-semua-yang-sama',
    nomor: 10,
    judul: 'Lingkari Semua',
    tag: 'Pilah Kategori',
    borderColor: '#67E8F9',
    numBg: '#06B6D4',
    tagBg: '#ECFEFF',
    tagColor: '#0E7490',
    objek: 'payung',
    warna: 'tosca',
    mode: 'warna',
    aktif: true,
  },

  // 2 Latihan Tahap 5 (Aktif)
  {
    id: 'ikuti-garis',
    nomor: 11,
    judul: 'Ikuti Garis',
    tag: 'Motorik Halus',
    borderColor: '#C7D2FE',
    numBg: '#6366F1',
    tagBg: '#EEF2FF',
    tagColor: '#4338CA',
    objek: 'mobil',
    warna: 'biru',
    mode: 'garis',
    aktif: true,
  },
  {
    id: 'warnai-seperti-contoh',
    nomor: 12,
    judul: 'Warnai Sesuai Contoh',
    tag: 'Kreativitas',
    borderColor: '#FDBA74',
    numBg: '#F97316',
    tagBg: '#FFF7ED',
    tagColor: '#C2410C',
    objek: 'perahu',
    warna: 'oranye',
    mode: 'warna',
    aktif: true,
  },
];

/**
 * Layar Beranda: Menampilkan 12 modul latihan persepsi visual dalam antarmuka
 * bubbly neobrutalist ramah balita (Google Stitch style), sakelar audio instan,
 * tombol pengaman long-press 2.5 detik untuk Area Orang Tua, dan panduan OS tablet.
 */
export class LayarBeranda implements Layar {
  private host: HTMLElement | null = null;
  private readonly opsi: OpsiBeranda;
  private unbindCleanups: Array<() => void> = [];

  constructor(opsi: OpsiBeranda) {
    this.opsi = opsi;
  }

  get pengaturan(): OpsiBeranda {
    return this.opsi;
  }

  mount(host: HTMLElement): void {
    this.host = host;
    this.unbindCleanups = [];

    // 4.0d: Gesture pertama di beranda membuka kunci audio dengan capture: true agar berjalan
    // SEBELUM handler kartu memicu perpindahan layar
    const handleFirstGesture = () => {
      unlockAudio();
    };
    host.addEventListener('pointerdown', handleFirstGesture, { capture: true, once: true });
    this.unbindCleanups.push(() => {
      host.removeEventListener('pointerdown', handleFirstGesture, { capture: true });
    });

    const audioAktif = isAudioInstruksiAktif();

    host.innerHTML = `
      <div class="beranda-page-wrapper">
        <!-- Header Stitch Beranda -->
        <header class="beranda-header-stitch" data-purpose="app-header">
          <!-- Brand & Subtitle -->
          <div class="beranda-brand">
            <div class="beranda-brand-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <div class="beranda-brand-titles">
              <div class="beranda-title-row">
                <h1 class="beranda-title">Latihan Persepsi Visual</h1>
                <span class="pill-seru">Latihan Seru</span>
              </div>
              <p class="beranda-subtitle">Pilih latihan kesukaanmu (minimal 10 soal)</p>
            </div>
          </div>

          <!-- Aksi Header: Sakelar Audio & Area Orang Tua -->
          <div class="beranda-header-actions">
            <!-- Sakelar Audio Instruksi -->
            <button
              id="btn-sound-toggle"
              class="btn-sound-toggle ${audioAktif ? '' : 'is-muted'}"
              type="button"
              aria-label="${audioAktif ? 'Suara narasi aktif, ketuk untuk mematikan' : 'Suara narasi senyap, ketuk untuk mengaktifkan'}"
            >
              <span aria-hidden="true" style="font-size: 15px;">${audioAktif ? '🔊' : '🔇'}</span>
              <span id="btn-sound-text">${audioAktif ? 'Suara Aktif' : 'Suara Senyap'}</span>
            </button>

            <!-- Tombol Area Orang Tua (Long-press 2.5s - 4.0a, 4.0c) -->
            <button
              id="btn-area-orang-tua"
              class="btn-orang-tua-stitch"
              type="button"
              aria-label="Area Orang Tua, tahan dua setengah detik untuk membuka"
            >
              <svg class="progress-ring" viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="18" stroke="#334155" stroke-width="5" fill="none" opacity="0.4" />
                <circle class="progress-ring-circle" cx="22" cy="22" r="18" />
              </svg>
              <span style="display: inline-flex; align-items: center; gap: 6px; position: relative; z-index: 2;">
                <span aria-hidden="true" style="font-size: 15px;">⚙️</span>
                <span>Orang Tua <span style="font-size: 11px; color: #94A3B8; font-weight: 600;">(Tahan 2.5s)</span></span>
              </span>
            </button>
          </div>
        </header>

        <!-- 12 Kartu Latihan Bubbly Neobrutalist Grid -->
        <main class="beranda-grid-stitch" id="beranda-cards-grid">
          ${DAFTAR_KARTU.map((kartu) => {
            const svgContent = renderObjek(kartu.objek, kartu.warna, kartu.mode);
            return `
              <div
                id="kartu-${kartu.id}"
                class="kartu-stitch active-card"
                style="border-color: ${kartu.borderColor};"
                tabindex="0"
                role="button"
                aria-disabled="false"
                aria-label="${kartu.nomor}. ${kartu.judul}"
              >
                <div class="kartu-stitch-top">
                  <span class="kartu-num-badge" style="background-color: ${kartu.numBg};">${kartu.nomor}</span>
                  <span class="kartu-tag-pill" style="background-color: ${kartu.tagBg}; color: ${kartu.tagColor};">${kartu.tag}</span>
                </div>
                <div class="kartu-illustration-wrap">
                  ${svgContent}
                </div>
                <h2 class="kartu-stitch-title">${kartu.judul}</h2>
              </div>
            `;
          }).join('')}
        </main>
      </div>
    `;

    // Pasang Sakelar Audio Narasi
    const btnSound = host.querySelector<HTMLButtonElement>('#btn-sound-toggle');
    const btnSoundText = host.querySelector<HTMLElement>('#btn-sound-text');
    if (btnSound) {
      const handleToggleSound = () => {
        const baru = !isAudioInstruksiAktif();
        setAudioInstruksiAktif(baru);
        btnSound.classList.toggle('is-muted', !baru);
        btnSound.setAttribute(
          'aria-label',
          baru
            ? 'Suara narasi aktif, ketuk untuk mematikan'
            : 'Suara narasi senyap, ketuk untuk mengaktifkan'
        );
        const iconSpan = btnSound.firstElementChild as HTMLElement;
        if (iconSpan) {
          iconSpan.textContent = baru ? '🔊' : '🔇';
        }
        if (btnSoundText) {
          btnSoundText.textContent = baru ? 'Suara Aktif' : 'Suara Senyap';
        }
      };
      btnSound.addEventListener('click', handleToggleSound);
      this.unbindCleanups.push(() => {
        btnSound.removeEventListener('click', handleToggleSound);
      });
    }

    // Pasang Long-Press pada tombol Area Orang Tua (4.0c)
    const btnOrangTua = host.querySelector<HTMLElement>('#btn-area-orang-tua');
    if (btnOrangTua) {
      const unbindLongPress = pasangLongPress(btnOrangTua, {
        durasiMs: 2500,
        onSelesai: () => {
          this.opsi.onBukaAreaOrangTua();
        },
      });
      this.unbindCleanups.push(unbindLongPress);
    }

    // Pasang registerTapTarget pada ke-12 kartu latihan aktif
    for (const kartu of DAFTAR_KARTU) {
      if (!kartu.aktif) continue;
      const el = host.querySelector<HTMLElement>(`#kartu-${kartu.id}`);
      if (el) {
        const unregisterTap = registerTapTarget(el, () => {
          this.opsi.onPilihLatihan(kartu.id);
        });
        this.unbindCleanups.push(unregisterTap);
      }
    }
  }

  destroy(): void {
    for (const cleanup of this.unbindCleanups) {
      try {
        cleanup();
      } catch (err) {
        console.warn('Error saat cleanup Beranda:', err);
      }
    }
    this.unbindCleanups = [];

    if (this.host) {
      this.host.innerHTML = '';
      this.host = null;
    }
  }
}

