import { Layar } from '../shell/tipe';
import { SesiLatihan } from './sesi';
import { Pilihan } from './tipe';
import { renderObjek } from '../graphics/render-aman';
import { registerTapTarget } from '../input/touch';
import { PengelolaUmpanBalik } from './umpan-balik';
import { siapkanInstruksi, mainkanSukses } from '../audio/engine';

export interface OpsiMesinPilihSatu {
  sesi: SesiLatihan;
  onKembaliKeBeranda: () => void;
}

/**
 * Mesin Latihan Pilih-Satu & Multi-Pilih Generik:
 * Merender seluruh latihan #1-#10 dari objek Soal dalam satu viewport 100dvh tanpa scroll.
 */
export class MesinPilihSatu implements Layar {
  private host: HTMLElement | null = null;
  private readonly sesi: SesiLatihan;
  private readonly onKembali: () => void;
  private readonly umpanBalik: PengelolaUmpanBalik;
  private unregisterTargets: Array<() => void> = [];
  private jumlahSalahPadaSoalIni = 0;
  private elemenAudioInstruksi: HTMLAudioElement | null = null;
  private readonly targetDitemukan = new Set<string>();

  constructor(opsi: OpsiMesinPilihSatu) {
    this.sesi = opsi.sesi;
    this.onKembali = opsi.onKembaliKeBeranda;
    this.umpanBalik = new PengelolaUmpanBalik();
  }

  mount(host: HTMLElement): void {
    this.host = host;
    this.tampilkanSoalAktif();
  }

  destroy(): void {
    this.bersihkanListenerSentuh();
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

  private bersihkanListenerSentuh(): void {
    for (const unbind of this.unregisterTargets) {
      unbind();
    }
    this.unregisterTargets = [];
  }

  private tampilkanSoalAktif(): void {
    if (!this.host) return;
    this.bersihkanListenerSentuh();
    this.umpanBalik.bukaKunciInput();
    this.jumlahSalahPadaSoalIni = 0;
    this.targetDitemukan.clear();

    const soal = this.sesi.soalSaatIni;
    if (!soal) {
      // Sesi selesai
      this.onKembali();
      return;
    }

    // Siapkan audio instruksi secara sinkron
    this.elemenAudioInstruksi = siapkanInstruksi(soal.audioId);

    const adaContoh = soal.contoh.length > 0;
    const kelasGrid =
      soal.jumlahPilihan === 2
        ? 'grid-2'
        : soal.jumlahPilihan === 3
          ? 'grid-3'
          : soal.jumlahPilihan === 8
            ? 'grid-8'
            : 'grid-4';

    const nomorTantangan = this.sesi.indeksSaatIni + 1;
    const totalTantangan = this.sesi.totalSoal;

    // Buat indikator segmen progres
    const segmentsHtml = Array.from({ length: totalTantangan }, (_, i) => {
      if (i < this.sesi.indeksSaatIni) {
        return `<span class="progress-segment selesai" title="Selesai"></span>`;
      } else if (i === this.sesi.indeksSaatIni) {
        return `<span class="progress-segment aktif" title="Soal Aktif"></span>`;
      } else {
        return `<span class="progress-segment" title="Soal ${i + 1}"></span>`;
      }
    }).join('');

    const badgeContoh = this.getBadgeContoh(soal.idLatihan);

    const ukuranPilihan =
      soal.jumlahPilihan === 8
        ? 54
        : soal.jumlahPilihan === 2
          ? 84
          : soal.jumlahPilihan === 3
            ? 80
            : 74;

    this.host.innerHTML = `
      <div class="layar-latihan">
        <!-- Baris 1: Header Bubbly Stitch -->
        <header class="latihan-header-stitch">
          <!-- Tombol Kembali -->
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

        <!-- Baris 3: Area Permainan Tengah -->
        <main class="area-permainan-tengah">
          <!-- Kartu Contoh (Bila ada) -->
          ${
            adaContoh
              ? `
            <div id="wrapper-contoh" class="kartu-contoh-stitch">
              <span class="kartu-contoh-badge">${badgeContoh}</span>
              <div style="display: flex; gap: 14px; align-items: center; justify-content: center;">
                ${soal.contoh
                  .map(
                    (c) => `
                  <div style="display: flex; align-items: center; justify-content: center;">
                    ${this.renderItemVisual(c, 76)}
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          <!-- Kisi Kartu Pilihan Jawaban -->
          <div class="grid-pilihan-stitch ${kelasGrid}">
            ${soal.pilihan
              .map((p, idx) => {
                const borderColor = this.getWarnaBorderPilihan(p, idx);
                const labelText = this.getLabelPilihan(p, soal.idLatihan);
                const labelColor = this.getLabelColor(p);
                return `
                  <div
                    class="kartu-pilihan-stitch slot-pilihan"
                    data-pilihan-id="${p.id}"
                    data-benar="${p.benar}"
                    style="border-color: ${borderColor};"
                    tabindex="0"
                    role="button"
                    aria-label="${labelText || 'Pilihan ' + (idx + 1)}"
                  >
                    <div class="slot-inner">
                      ${this.renderItemVisual(p, ukuranPilihan * p.skala)}
                    </div>
                    ${labelText ? `<span class="kartu-pilihan-label" style="color: ${labelColor};">${labelText}</span>` : ''}
                  </div>
                `;
              })
              .join('')}
          </div>
        </main>

        <!-- Baris 4: Bilah Bawah Permainan -->
        <footer class="latihan-footer-stitch">
          <div class="toast-semangat-stitch">
            <span aria-hidden="true">🌟</span>
            <span>Bagus sekali! Perhatikan baik-baik ya!</span>
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

    // Pasang handler tombol kembali
    const btnKembali = this.host.querySelector<HTMLElement>('#btn-kembali-latihan');
    if (btnKembali) {
      const unbind = registerTapTarget(btnKembali, () => {
        this.onKembali();
      });
      this.unregisterTargets.push(unbind);
    }

    // Pasang handler audio
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
        const contohWrapper = this.host?.querySelector<HTMLElement>('#wrapper-contoh');
        if (contohWrapper) {
          contohWrapper.classList.remove('anim-pulse-contoh');
          void contohWrapper.offsetWidth;
          contohWrapper.classList.add('anim-pulse-contoh');
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

    // Daftarkan setiap slot pilihan dengan registerTapTarget
    const slotElements = this.host.querySelectorAll<HTMLElement>('.slot-pilihan');
    slotElements.forEach((slot) => {
      const unbind = registerTapTarget(slot, () => {
        this.tanganiKetukanPilihan(slot);
      });
      this.unregisterTargets.push(unbind);
    });
  }

  private getBadgeContoh(idLatihan: string): string {
    if (idLatihan === 'cocokkan-warna') return 'WARNA CONTOH';
    if (idLatihan === 'cocokkan-bentuk') return 'BENTUK CONTOH';
    if (idLatihan === 'cocokkan-bayangan') return 'SILUET CONTOH';
    if (idLatihan === 'lanjutkan-pola') return 'POLA CONTOH';
    return 'CONTOH';
  }

  private getWarnaBorderPilihan(pilihan: Pilihan, idx: number): string {
    const defaultPalette = ['#C084FC', '#FB7185', '#FBBF24', '#34D399', '#38BDF8', '#F472B6', '#A78BFA', '#F97316'];
    if (this.sesi.idLatihan === 'cocokkan-warna' && pilihan.warna) {
      const borderMap: Record<string, string> = {
        merah: '#FDA4AF',
        oranye: '#FDBA74',
        kuning: '#FCD34D',
        hijau: '#6EE7B7',
        biru: '#7DD3FC',
        ungu: '#D8B4FE',
        pink: '#F472B6',
        tosca: '#67E8F9',
      };
      if (borderMap[pilihan.warna]) return borderMap[pilihan.warna];
    }
    return defaultPalette[idx % defaultPalette.length];
  }

  private getLabelColor(pilihan: Pilihan): string {
    if (this.sesi.idLatihan === 'cocokkan-warna' && pilihan.warna) {
      const textMap: Record<string, string> = {
        merah: '#BE123C',
        oranye: '#C2410C',
        kuning: '#B45309',
        hijau: '#047857',
        biru: '#0369A1',
        ungu: '#7E22CE',
        pink: '#BE185D',
        tosca: '#0E7490',
      };
      if (textMap[pilihan.warna]) return textMap[pilihan.warna];
    }
    return '#1E293B';
  }

  private getLabelPilihan(pilihan: Pilihan, idLatihan: string): string {
    if (pilihan.isPlaceholder) return '';
    if (pilihan.labelAngka !== undefined) return `Angka ${pilihan.labelAngka}`;
    if (idLatihan === 'cocokkan-warna' && pilihan.warna) {
      const namaWarna: Record<string, string> = {
        merah: 'Merah',
        oranye: 'Oranye',
        kuning: 'Kuning',
        hijau: 'Hijau',
        biru: 'Biru',
        ungu: 'Ungu',
        pink: 'Merah Muda',
        tosca: 'Toska',
      };
      return namaWarna[pilihan.warna] ?? pilihan.warna;
    }
    if (idLatihan === 'cocokkan-bentuk') {
      const namaBentuk: Record<string, string> = {
        lingkaran: 'Lingkaran',
        persegi: 'Persegi',
        segitiga: 'Segitiga',
        bintang: 'Bintang',
        hati: 'Hati',
        bulan: 'Bulan',
      };
      return namaBentuk[pilihan.objek] ?? '';
    }
    if (idLatihan === 'besar-kecil') {
      return pilihan.skala >= 0.8 ? 'Besar' : 'Kecil';
    }
    return '';
  }

  private renderItemVisual(pilihan: Pilihan, ukuran: number): string {
    if (pilihan.isPlaceholder) {
      return `<div class="slot-placeholder-pola">?</div>`;
    }
    if (pilihan.labelAngka !== undefined) {
      return `<div class="tombol-angka-chunky">${pilihan.labelAngka}</div>`;
    }
    const warna = pilihan.warna ?? 'biru';
    return renderObjek(pilihan.objek, warna, pilihan.mode, {
      size: Math.round(ukuran),
      className: 'svg-objek-latihan',
    });
  }

  private tanganiKetukanPilihan(slotElement: HTMLElement): void {
    if (this.umpanBalik.terkunci) return;

    const isBenar = slotElement.getAttribute('data-benar') === 'true';
    const isMultiTarget = this.sesi.soalSaatIni?.idLatihan === 'lingkari-semua-yang-sama';

    if (isMultiTarget) {
      if (isBenar) {
        const pilihanId = slotElement.getAttribute('data-pilihan-id') ?? '';
        if (this.targetDitemukan.has(pilihanId)) {
          return; // Sudah dilingkari
        }
        this.targetDitemukan.add(pilihanId);
        slotElement.classList.add('slot-terlingkari');

        if (this.targetDitemukan.size < 3) {
          mainkanSukses();
          return;
        }

        // Ketiga target berhasil dilingkari!
        const semuaSlotBenar = this.host?.querySelectorAll<HTMLElement>(
          '.slot-pilihan[data-benar="true"]'
        );
        semuaSlotBenar?.forEach((s) => {
          s.classList.remove('anim-pop-scale');
          void s.offsetWidth;
          s.classList.add('anim-pop-scale');
        });

        this.umpanBalik.beriUmpanBalikBenar(slotElement, () => {
          this.sesi.lanjutSoalBerikutnya();
          if (!this.sesi.apakahSelesai) {
            this.tampilkanSoalAktif();
          }
        });
      } else {
        this.jumlahSalahPadaSoalIni++;
        this.umpanBalik.beriUmpanBalikSalah(slotElement);
      }
      return;
    }

    if (isBenar) {
      // Jika latihan cari-pasangannya, animasikan kedua kartu kembar bersamaan
      if (this.sesi.soalSaatIni?.idLatihan === 'cari-pasangannya') {
        const semuaSlotBenar = this.host?.querySelectorAll<HTMLElement>(
          '.slot-pilihan[data-benar="true"]'
        );
        semuaSlotBenar?.forEach((slot) => {
          if (slot !== slotElement) {
            slot.classList.remove('anim-pop-scale');
            void slot.offsetWidth;
            slot.classList.add('anim-pop-scale');
          }
        });
      }

      // Umpan Balik Benar: pop-scale + audio sukses -> jeda tenang -> soal berikutnya
      this.umpanBalik.beriUmpanBalikBenar(slotElement, () => {
        this.sesi.lanjutSoalBerikutnya();
        if (!this.sesi.apakahSelesai) {
          this.tampilkanSoalAktif();
        }
      });
    } else {
      // Umpan Balik Salah: wobble rotasi senyap tanpa audio
      this.jumlahSalahPadaSoalIni++;
      this.umpanBalik.beriUmpanBalikSalah(slotElement);

      // Scaffolding Dua Tahap:
      // Tahap 1: 3 salah -> putar ulang audio instruksi + pulse lembut pada objek contoh
      if (this.jumlahSalahPadaSoalIni === 3) {
        if (this.elemenAudioInstruksi) {
          this.elemenAudioInstruksi.currentTime = 0;
          this.elemenAudioInstruksi.play().catch(() => {});
        }
        const contohWrapper = this.host?.querySelector<HTMLElement>('#wrapper-contoh');
        if (contohWrapper) {
          contohWrapper.classList.add('anim-pulse-contoh');
        }
      }

      // Tahap 2: 6 salah -> pengecoh meredup ke opacity 0.35 dalam 600ms
      if (this.jumlahSalahPadaSoalIni >= 6 && this.host) {
        const semuaSlot = this.host.querySelectorAll<HTMLElement>('.slot-pilihan');
        semuaSlot.forEach((s) => {
          if (s.getAttribute('data-benar') !== 'true') {
            s.classList.add('slot-distractor-dimmed');
          }
        });
      }
    }
  }
}
