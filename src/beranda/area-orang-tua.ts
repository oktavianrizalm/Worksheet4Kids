import { Layar } from '../shell/tipe';
import { isAudioInstruksiAktif, setAudioInstruksiAktif } from '../audio/engine';
import { terapkanModeGelap, isModeGelap } from '../tokens';
import { simpanPreferensiOrangTua } from '../preferensi';

export interface OpsiAreaOrangTua {
  onKembali: () => void;
  seedTerakhir?: number;
}

/**
 * Layar Area Orang Tua (4.0a).
 * Memuat panduan penguncian sistem tablet, toggle audio narasi,
 * dan info build mode dev. Tanpa kata "Keluar", navigasi kembali memakai tombol biasa.
 */
export class LayarAreaOrangTua implements Layar {
  private host: HTMLElement | null = null;
  private readonly opsi: OpsiAreaOrangTua;
  private unbindListeners: (() => void) | null = null;

  constructor(opsi: OpsiAreaOrangTua) {
    this.opsi = opsi;
  }

  mount(host: HTMLElement): void {
    this.host = host;
    const audioAktif = isAudioInstruksiAktif();
    const gelapAktif = isModeGelap();

    let devSectionHtml = '';
    if (import.meta.env.DEV) {
      devSectionHtml = `
        <section class="kartu-panduan kartu-panduan-dev">
          <h2 class="kartu-panduan-judul">Informasi Sistem (Mode Pengembang)</h2>
          <p class="dev-info-baris"><strong>Versi Build:</strong> 0.1.0 (Dev)</p>
          <p class="dev-info-baris"><strong>Seed Sesi Terakhir:</strong> ${this.opsi.seedTerakhir !== undefined ? this.opsi.seedTerakhir : 'Belum ada sesi latihan'}</p>
          <p class="dev-info-baris"><strong>Arsitektur:</strong> Vite + TypeScript Murni (Nol Framework UI)</p>
        </section>
      `;
    }

    host.innerHTML = `
      <div class="area-orang-tua-container safe-area-container">
        <header class="area-orang-tua-header">
          <button id="btn-kembali-ke-beranda" class="btn-kembali" aria-label="Kembali ke Beranda">
            ← Kembali
          </button>
          <h1 class="area-orang-tua-title">Area Orang Tua</h1>
        </header>

        <main class="area-orang-tua-content">
          <!-- Pengaturan Audio Instruksi -->
          <section class="kartu-panduan">
            <h2 class="kartu-panduan-judul">Pengaturan Audio Instruksi</h2>
            <div class="sakelar-baris">
              <div>
                <label for="sakelar-audio" class="sakelar-label">Suara Instruksi Narasi</label>
                <p class="sakelar-keterangan">Memutar rekaman narasi petunjuk untuk setiap latihan.</p>
              </div>
              <input type="checkbox" id="sakelar-audio" class="sakelar-input" ${audioAktif ? 'checked' : ''} />
            </div>
          </section>

          <!-- Pengaturan Mode Gelap -->
          <section class="kartu-panduan">
            <h2 class="kartu-panduan-judul">Mode Gelap 🌙</h2>
            <div class="sakelar-baris">
              <div>
                <label for="sakelar-gelap" class="sakelar-label">Tampilan Gelap</label>
                <p class="sakelar-keterangan">Menggunakan latar belakang gelap yang lembut untuk kenyamanan mata anak saat bermain di ruangan redup.</p>
              </div>
              <input type="checkbox" id="sakelar-gelap" class="sakelar-input" ${gelapAktif ? 'checked' : ''} />
            </div>
          </section>

          <!-- Panduan Kunci Layar Sistem -->
          <section class="kartu-panduan">
            <h2 class="kartu-panduan-judul">Panduan Pengunci Layar (Kenyamanan Balita)</h2>
            <p class="panduan-keterangan">
              Pinch-zoom dan gesture sistem tidak dapat dicegah secara andal hanya melalui peramban. Gunakan fitur pengunci bawaan sistem operasi tablet Anda agar balita nyaman beraktivitas:
            </p>

            <div class="panduan-os">
              <h3 class="panduan-os-nama">Apple iPadOS — Guided Access (Akses Terpandu)</h3>
              <ol class="panduan-langkah">
                <li>Buka <strong>Pengaturan > Aksesibilitas > Akses Terpandu</strong>, lalu aktifkan.</li>
                <li>Buka aplikasi webapp ini di Safari layar penuh (PWA).</li>
                <li>Tekan tombol Daya/Atas sebanyak <strong>3 kali berturut-turut</strong> untuk mengunci layar.</li>
              </ol>
            </div>

            <div class="panduan-os" style="margin-top: 16px;">
              <h3 class="panduan-os-nama">Android Tablet — App Pinning (Sematkan Aplikasi)</h3>
              <ol class="panduan-langkah">
                <li>Buka <strong>Setelan > Keamanan > Sematkan Aplikasi (App Pinning)</strong>, lalu aktifkan.</li>
                <li>Buka tampilan aplikasi terkini (recent apps), ketuk ikon webapp ini, lalu pilih <strong>Sematkan / Pin</strong>.</li>
                <li>Tablet sekarang terkunci pada aplikasi ini hingga Anda membukanya dengan PIN/pola.</li>
              </ol>
            </div>
          </section>

          <!-- Info Mode Dev / Versi (tereliminasi murni pada build produksi) -->
          ${devSectionHtml}

          <div class="area-orang-tua-footer-info">
            Versi 0.1.0 • Desain Khusus Anak Usia 3 Tahun
          </div>
        </main>
      </div>
    `;

    const btnKembali = host.querySelector<HTMLButtonElement>('#btn-kembali-ke-beranda');
    const sakelarAudio = host.querySelector<HTMLInputElement>('#sakelar-audio');
    const sakelarGelap = host.querySelector<HTMLInputElement>('#sakelar-gelap');

    const handleKembali = () => {
      this.opsi.onKembali();
    };

    const handleToggleAudio = () => {
      if (sakelarAudio) {
        setAudioInstruksiAktif(sakelarAudio.checked);
      }
    };

    const handleToggleGelap = () => {
      if (sakelarGelap) {
        terapkanModeGelap(sakelarGelap.checked);
        simpanPreferensiOrangTua({ modeGelap: sakelarGelap.checked });
      }
    };

    btnKembali?.addEventListener('click', handleKembali);
    sakelarAudio?.addEventListener('change', handleToggleAudio);
    sakelarGelap?.addEventListener('change', handleToggleGelap);

    this.unbindListeners = () => {
      btnKembali?.removeEventListener('click', handleKembali);
      sakelarAudio?.removeEventListener('change', handleToggleAudio);
      sakelarGelap?.removeEventListener('change', handleToggleGelap);
    };
  }

  destroy(): void {
    if (this.unbindListeners) {
      this.unbindListeners();
      this.unbindListeners = null;
    }
    if (this.host) {
      this.host.innerHTML = '';
      this.host = null;
    }
  }
}
