import { TOKENS } from '../tokens';

export const MAX_CONTACT_SIZE = TOKENS.touch.maxContactSize; // 45 px
export const TAP_DEBOUNCE_MS = TOKENS.touch.tapDebounceMs;   // 250 ms

export type TapCallback = (event: PointerEvent) => void;

export type VerdictType =
  | 'ACCEPTED_DOWN'
  | 'ACCEPTED_TAP'
  | 'REJECTED_PALM_DOWN'
  | 'REJECTED_PALM_UP'
  | 'REJECTED_MISMATCH'
  | 'REJECTED_DEBOUNCE'
  | 'REJECTED_CANCEL';

export interface PointerDiagnosticLog {
  id: number;
  time: string;
  type: string;
  pointerId: number;
  pointerType: string;
  width: number;
  height: number;
  isPrimary: boolean;
  verdict: VerdictType;
  reason: string;
}

// Diagnostic listeners (untuk halaman galeri 2f)
const diagnosticListeners: Set<(log: PointerDiagnosticLog) => void> = new Set();
let logCounter = 1;

export function addDiagnosticListener(listener: (log: PointerDiagnosticLog) => void): () => void {
  diagnosticListeners.add(listener);
  return () => diagnosticListeners.delete(listener);
}

function emitDiagnostic(
  event: PointerEvent,
  verdict: VerdictType,
  reason: string
): void {
  if (diagnosticListeners.size === 0) return;
  const now = new Date();
  const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;

  const log: PointerDiagnosticLog = {
    id: logCounter++,
    time: timeStr,
    type: event.type,
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    width: Math.round(event.width),
    height: Math.round(event.height),
    isPrimary: event.isPrimary,
    verdict,
    reason,
  };

  diagnosticListeners.forEach((fn) => fn(log));
}

interface TrackedPointer {
  targetElement: HTMLElement;
  downTime: number;
}

const activePointers = new Map<number, TrackedPointer>();

export interface RegisterTapOptions {
  now?: () => number;
}

/**
 * Mendaftarkan sebuah HTMLElement sebagai target sentuh yang valid.
 *
 * Menerapkan:
 * 1. Penyaringan telapak tangan (Palm Rejection) berdasarkan ukuran kontak (width/height > 45px).
 * 2. Tidak membatasi hanya pada isPrimary (mencegah telapak duluan memblokir jari).
 * 3. Ketukan sah HANYA jika pointerdown dan pointerup pada elemen yang sama.
 * 4. Jeda debounce 250ms PER ELEMEN antar ketukan sah untuk menolak pantulan ganda.
 * 5. Sumber waktu dapat disuntikkan via opts.now untuk keperluan pengujian.
 *
 * Mengembalikan fungsi cleanup unregisterTapTarget.
 */
export function registerTapTarget(
  element: HTMLElement,
  onTap: TapCallback,
  opts?: RegisterTapOptions
): () => void {
  const getNow = opts?.now ?? (() => Date.now());
  let lastAcceptedTapTimestamp = 0; // Debounce per-elemen di dalam closure!

  // Pastikan elemen memiliki cursor pointer dan user-select none
  element.style.userSelect = 'none';
  (element.style as unknown as Record<string, string>)['-webkit-user-select'] = 'none';

  const onPointerDown = (e: PointerEvent) => {
    // 1. Saring ukuran kontak (Palm Rejection)
    // Catatan: Jika browser tidak mendukung width/height (misal mouse biasa), nilainya 1 atau 0.
    if (e.width > MAX_CONTACT_SIZE || e.height > MAX_CONTACT_SIZE) {
      emitDiagnostic(
        e,
        'REJECTED_PALM_DOWN',
        `Ukuran sentuh telapak (${Math.round(e.width)}x${Math.round(e.height)}px) > ${MAX_CONTACT_SIZE}px`
      );
      return;
    }

    // Catat pointer yang sah
    activePointers.set(e.pointerId, {
      targetElement: element,
      downTime: Date.now(),
    });

    try {
      element.setPointerCapture(e.pointerId);
    } catch {
      // Abaikan jika browser tidak mengizinkan pointer capture
    }

    emitDiagnostic(
      e,
      'ACCEPTED_DOWN',
      `Sentuhan jari dicatat (ukuran: ${Math.round(e.width)}x${Math.round(e.height)}px)`
    );
  };

  const onPointerUp = (e: PointerEvent) => {
    const tracked = activePointers.get(e.pointerId);
    if (!tracked) {
      // Pointer ini ditolak sejak pointerdown (misal telapak) atau bukan dari elemen ini
      return;
    }
    activePointers.delete(e.pointerId);

    try {
      element.releasePointerCapture(e.pointerId);
    } catch {
      // Abaikan
    }

    // 2. Periksa kembali ukuran kontak saat up
    if (e.width > MAX_CONTACT_SIZE || e.height > MAX_CONTACT_SIZE) {
      emitDiagnostic(
        e,
        'REJECTED_PALM_UP',
        `Ukuran pelepasan (${Math.round(e.width)}x${Math.round(e.height)}px) > ${MAX_CONTACT_SIZE}px`
      );
      return;
    }

    // 3. Pastikan pointerup terjadi pada elemen yang SAMA (di dalam batas bounding box elemen)
    const rect = element.getBoundingClientRect();
    const isInside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!isInside) {
      emitDiagnostic(
        e,
        'REJECTED_MISMATCH',
        'Jari terangkat di luar batas elemen target'
      );
      return;
    }

    // 4. Periksa jeda debounce (250 ms) per-elemen
    const now = getNow();
    if (now - lastAcceptedTapTimestamp < TAP_DEBOUNCE_MS) {
      emitDiagnostic(
        e,
        'REJECTED_DEBOUNCE',
        `Pantulan ganda ditolak (selisih: ${now - lastAcceptedTapTimestamp}ms < ${TAP_DEBOUNCE_MS}ms)`
      );
      return;
    }

    // Ketukan sah diterima!
    lastAcceptedTapTimestamp = now;
    emitDiagnostic(
      e,
      'ACCEPTED_TAP',
      'Ketukan SAH berhasil diterima & callback dipicu'
    );
    onTap(e);
  };

  const onPointerCancel = (e: PointerEvent) => {
    if (activePointers.has(e.pointerId)) {
      activePointers.delete(e.pointerId);
      emitDiagnostic(
        e,
        'REJECTED_CANCEL',
        'Sentuhan dibatalkan oleh sistem operasi / browser'
      );
    }
  };

  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointercancel', onPointerCancel);

  return () => {
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('pointerup', onPointerUp);
    element.removeEventListener('pointercancel', onPointerCancel);
  };
}
