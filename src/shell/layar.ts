import { Layar } from './tipe';

/**
 * Pengelola Layar: Mengelola pergantian layar dengan jaminan
 * memanggil destroy() pada layar lama sebelum me-mount layar baru.
 */
export class PengelolaLayar {
  private layarAktif: Layar | null = null;
  private readonly host: HTMLElement;

  constructor(host: HTMLElement) {
    this.host = host;
  }

  tampilkan(layarBaru: Layar): void {
    if (this.layarAktif) {
      this.layarAktif.destroy();
      this.layarAktif = null;

      // Verifikasi dengan assert di mode dev bahwa host benar-benar dikosongkan
      if (import.meta.env?.DEV) {
        console.assert(
          this.host.innerHTML === '' || this.host.children.length === 0,
          '[PengelolaLayar] Host harus kosong setelah memanggil destroy() layar sebelumnya!'
        );
      }
    }

    // Pastikan container host bersih sebelum mount layar baru
    this.host.innerHTML = '';

    this.layarAktif = layarBaru;
    this.layarAktif.mount(this.host);
  }

  destroy(): void {
    if (this.layarAktif) {
      this.layarAktif.destroy();
      this.layarAktif = null;
    }
    this.host.innerHTML = '';
  }
}
