import { TOKENS } from '../tokens';

export interface OpsiLongPress {
  durasiMs?: number;
  onSelesai: () => void;
  /**
   * Pengecekan tambahan apakah posisi sentuhan awal berada dalam zona sudut.
   */
  zonaSudutCheck?: (e: PointerEvent, el: HTMLElement) => boolean;
}

/**
 * Memasang pengendali gesture Long-Press (4.0c) untuk Tombol Area Orang Tua.
 *
 * Aturan Mutlak 4.0c:
 * 1. setPointerCapture pada pointerdown.
 * 2. Batal jika jari bergeser > 24 px dari titik awal.
 * 3. Batal pada pointercancel, pointerup, visibilitychange.
 * 4. Batal jika ada pointer kedua menyentuh layar (multi-touch).
 * 5. Cincin progres digerakkan murni oleh CSS transition/animation (kelas .is-pressing),
 *    BUKAN requestAnimationFrame.
 * 6. Hanya terhitung jika pointerdown dimulai di dalam zona sudut.
 */
export function pasangLongPress(
  element: HTMLElement,
  opsi: OpsiLongPress
): () => void {
  const durasi = opsi.durasiMs ?? TOKENS.touch.longPressExitMs; // 2500 ms
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let activePointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let activePointerCount = 0;

  const cancelPress = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    element.classList.remove('is-pressing');
    if (activePointerId !== null) {
      try {
        element.releasePointerCapture(activePointerId);
      } catch {
        // Abaikan jika capture sudah lepas
      }
      activePointerId = null;
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    // 4. Batal jika ada pointer lain yang sedang aktif di layar (multi-touch rejection)
    if (activePointerCount > 0) {
      cancelPress();
      return;
    }

    // 6. Hanya terhitung jika pointerdown dimulai di dalam zona sudut (bounding rect tombol sudut)
    const rect = element.getBoundingClientRect();
    const diDalamZona =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!diDalamZona) {
      return;
    }

    if (opsi.zonaSudutCheck && !opsi.zonaSudutCheck(e, element)) {
      return;
    }

    activePointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;

    // 1. setPointerCapture pada pointerdown
    try {
      element.setPointerCapture(e.pointerId);
    } catch {
      // Abaikan jika peramban membatasi pointer capture
    }

    // 5. Cincin progres digerakkan oleh CSS transition melalui penambahan kelas .is-pressing
    element.classList.add('is-pressing');

    timerId = setTimeout(() => {
      cancelPress();
      opsi.onSelesai();
    }, durasi);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (activePointerId === null || e.pointerId !== activePointerId) return;

    // 2. Batal jika jari bergeser > 24 px dari titik awal
    const jarak = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (jarak > 24) {
      cancelPress();
    }
  };

  // 3. Batal pada pointerup dan pointercancel
  const handlePointerUp = (e: PointerEvent) => {
    if (e.pointerId === activePointerId) {
      cancelPress();
    }
  };

  const handlePointerCancel = (e: PointerEvent) => {
    if (e.pointerId === activePointerId) {
      cancelPress();
    }
  };

  // Pelacakan multi-touch di level window: jika pointer ke-2 masuk, batalkan
  const handleWindowPointerDown = (_e: PointerEvent) => {
    activePointerCount++;
    if (activePointerCount > 1) {
      cancelPress();
    }
  };

  const handleWindowPointerUpOrCancel = (_e: PointerEvent) => {
    activePointerCount = Math.max(0, activePointerCount - 1);
  };

  // 3. Batal pada visibilitychange jika layar mati atau tab berpindah
  const handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible') {
      cancelPress();
    }
  };

  element.addEventListener('pointerdown', handlePointerDown);
  element.addEventListener('pointermove', handlePointerMove);
  element.addEventListener('pointerup', handlePointerUp);
  element.addEventListener('pointercancel', handlePointerCancel);

  window.addEventListener('pointerdown', handleWindowPointerDown, { passive: true });
  window.addEventListener('pointerup', handleWindowPointerUpOrCancel, { passive: true });
  window.addEventListener('pointercancel', handleWindowPointerUpOrCancel, { passive: true });
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    cancelPress();
    element.removeEventListener('pointerdown', handlePointerDown);
    element.removeEventListener('pointermove', handlePointerMove);
    element.removeEventListener('pointerup', handlePointerUp);
    element.removeEventListener('pointercancel', handlePointerCancel);

    window.removeEventListener('pointerdown', handleWindowPointerDown);
    window.removeEventListener('pointerup', handleWindowPointerUpOrCancel);
    window.removeEventListener('pointercancel', handleWindowPointerUpOrCancel);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
