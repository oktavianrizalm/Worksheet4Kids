/**
 * MODUL PREFERENSI ORANG TUA (5.1c)
 *
 * SATU-SATUNYA modul di seluruh proyek yang diizinkan menyentuh localStorage.
 * Aturan Mutlak:
 * 1. Kunci tunggal: 'prefOrtu'.
 * 2. Nilai hanya menyimpan preferensi orang tua: { audioInstruksiAktif: boolean }.
 * 3. Seluruh baca & tulis dibungkus try/catch; kegagalan jatuh ke in-memory tanpa error console.
 * 4. Nilai korup/tak dikenal otomatis kembali ke default dan ditimpa saat tulis berikutnya.
 * 5. DILARANG KERAS menyimpan: progres, riwayat soal, jumlah salah, durasi sesi,
 *    atau metrik apa pun yang berkaitan dengan performa anak.
 */

export interface PreferensiOrangTua {
  readonly audioInstruksiAktif: boolean;
  readonly modeGelap: boolean;
  readonly musikAktif: boolean;
}

export const PREFERENSI_DEFAULT: PreferensiOrangTua = {
  audioInstruksiAktif: true,
  modeGelap: false,
  musikAktif: true,
};

export const KUNCI_STORAGE_PREFERENSI = 'prefOrtu';

let stateInMemory: PreferensiOrangTua = { ...PREFERENSI_DEFAULT };

function validasiBentukPreferensi(data: unknown): data is PreferensiOrangTua {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  if (typeof p.audioInstruksiAktif !== 'boolean') return false;
  // modeGelap & musikAktif bersifat opsional untuk backward compatibility
  if ('modeGelap' in p && typeof p.modeGelap !== 'boolean') return false;
  if ('musikAktif' in p && typeof p.musikAktif !== 'boolean') return false;
  return true;
}

function muatPreferensi(): PreferensiOrangTua {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return stateInMemory;
    }
    const raw = window.localStorage.getItem(KUNCI_STORAGE_PREFERENSI);
    if (!raw) {
      return stateInMemory;
    }
    const parsed = JSON.parse(raw);
    if (validasiBentukPreferensi(parsed)) {
      stateInMemory = {
        audioInstruksiAktif: parsed.audioInstruksiAktif,
        modeGelap: typeof parsed.modeGelap === 'boolean' ? parsed.modeGelap : false,
        musikAktif: typeof parsed.musikAktif === 'boolean' ? parsed.musikAktif : true,
      };
    } else {
      // Nilai korup atau format tak dikenal -> reset ke default
      stateInMemory = { ...PREFERENSI_DEFAULT };
    }
  } catch {
    // Tangani StorageDisabled, SecurityError (misal Safari Private Browsing) secara hening
    stateInMemory = { ...PREFERENSI_DEFAULT };
  }
  return stateInMemory;
}

// Inisialisasi awal saat modul pertama kali diimpor
muatPreferensi();

/**
 * Mengambil preferensi orang tua saat ini (membaca dari cache in-memory yang tersinkronisasi).
 */
export function getPreferensiOrangTua(): PreferensiOrangTua {
  return stateInMemory;
}

/**
 * Memperbarui preferensi orang tua dan menyimpannya ke localStorage secara aman.
 */
export function simpanPreferensiOrangTua(
  perubahan: Partial<PreferensiOrangTua>
): PreferensiOrangTua {
  const updated: PreferensiOrangTua = {
    ...stateInMemory,
    ...perubahan,
  };
  stateInMemory = updated;

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        KUNCI_STORAGE_PREFERENSI,
        JSON.stringify(updated)
      );
    }
  } catch {
    // Abaikan kegagalan storage secara hening tanpa mencemari console
  }

  return stateInMemory;
}
