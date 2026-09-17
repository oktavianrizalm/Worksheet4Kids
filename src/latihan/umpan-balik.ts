import { mainkanSukses } from '../audio/engine';

export interface UmpanBalikHooks {
  onSelesaiAnimasiBenar: () => void;
  onSelesaiAnimasiSalah: () => void;
}

/**
 * Modul Umpan Balik: Menjalankan animasi pop-scale (jawaban benar)
 * atau wobble rotasi (jawaban salah) pada elemen pembungkus slot.
 * Menghormati prefers-reduced-motion tanpa menghilangkan umpan balik.
 */
export class PengelolaUmpanBalik {
  private isInputLocked = false;

  get terkunci(): boolean {
    return this.isInputLocked;
  }

  kunciInput(): void {
    this.isInputLocked = true;
  }

  bukaKunciInput(): void {
    this.isInputLocked = false;
  }

  beriUmpanBalikBenar(elemenSlot: HTMLElement, onLanjut: () => void): void {
    this.kunciInput();
    mainkanSukses();

    elemenSlot.classList.remove('anim-pop-scale');
    // Force reflow untuk me-restart animasi jika diperlukan
    void elemenSlot.offsetWidth;
    elemenSlot.classList.add('anim-pop-scale');

    const handleEnd = () => {
      elemenSlot.removeEventListener('animationend', handleEnd);
      setTimeout(() => {
        onLanjut();
      }, 550); // Jeda tenang 550ms sebelum lanjut ke soal berikutnya
    };

    elemenSlot.addEventListener('animationend', handleEnd, { once: true });
  }

  beriUmpanBalikSalah(elemenSlot: HTMLElement, onSelesai?: () => void): void {
    // Ketukan salah TIDAK PERNAH mengunci input
    elemenSlot.classList.remove('anim-wobble');
    void elemenSlot.offsetWidth;
    elemenSlot.classList.add('anim-wobble');

    const handleEnd = () => {
      elemenSlot.removeEventListener('animationend', handleEnd);
      elemenSlot.classList.remove('anim-wobble');
      if (onSelesai) onSelesai();
    };

    elemenSlot.addEventListener('animationend', handleEnd, { once: true });
  }
}
