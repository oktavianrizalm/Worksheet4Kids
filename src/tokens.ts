/**
 * TOKENS DESAIN TUNGGAL (Single Source of Truth)
 * Diekspos sebagai konstanta TypeScript DAN variabel CSS (--token-*)
 * Warna pekat HANYA untuk objek jawaban. Semua chrome netral.
 * Area kerja objek selalu putih (#FFFFFF) di kedua skema warna.
 */

export const PALETTE = {
  merah: '#E8332F',
  oranye: '#F78C21',
  kuning: '#FDCB1E',
  hijau: '#4CB84C',
  biru: '#2B80D9',
  ungu: '#9452BF',
  pink: '#F26BA0',
  tosca: '#29BAB5',
} as const;

export type PaletteColorKey = keyof typeof PALETTE;
export type PaletteColorHex = typeof PALETTE[PaletteColorKey];

export const TOKENS = {
  palette: PALETTE,
  object: {
    strokeColor: '#22232E',
    strokeWidth: 3,
    silhouetteColor: '#22232E',
    outlineFill: '#FFFFFF',
    viewBoxSize: 100,
  },
  // Chrome Netral - Warna pekat DILARANG di sini
  chrome: {
    // Mode Terang
    bg: '#F3F4F6',
    cardBg: '#FFFFFF', // Tempat objek selalu putih
    cardBorder: '#22232E',
    textMain: '#22232E',
    textMuted: '#6B7280',
    buttonBg: '#FFFFFF',
    buttonActive: '#E5E7EB',
    shadowOffset: '4px 4px 0px #22232E',
    shadowOffsetSm: '2px 2px 0px #22232E',
    
    // Mode Gelap (prefers-color-scheme: dark)
    // Catatan: area kerja kartu objek TETAP PUTIH (#FFFFFF) agar kontras visual objek identik dengan kertas
    bgDark: '#1E1F29',
    cardBgDark: '#FFFFFF', // Tetap putih murni untuk area kanvas objek
    surfaceDark: '#282A36', // Untuk chrome/latar belakang panel
    textMainDark: '#F3F4F6',
    textMutedDark: '#9CA3AF',
    cardBorderDark: '#22232E',
    shadowOffsetDark: '4px 4px 0px #0A0B10',
    shadowOffsetSmDark: '2px 2px 0px #0A0B10',
  },
  touch: {
    minTargetSize: 64, // Area sentuh minimum 64x64 px
    maxContactSize: 45, // Palm rejection: sentuhan dengan width/height > 45 ditolak
    tapDebounceMs: 250, // Jeda antar ketukan sah untuk menolak pantulan ganda
    longPressExitMs: 2500, // Durasi tombol keluar orang tua
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  typography: {
    fontFamily: '"Baloo 2", "Nunito", "Quicksand", system-ui, -apple-system, sans-serif',
    sizeSm: 14,
    sizeBase: 18,
    sizeLg: 24,
    sizeXl: 32,
    sizeHeading: 40,
    weightBold: 700,
    weightHeavy: 800,
  },
} as const;

/**
 * Menghasilkan blok string CSS kustom property untuk disuntikkan ke dokumen
 */
export function getCssVariablesString(): string {
  return `
    :root {
      /* Palet 8 Warna Jawaban */
      --color-merah: ${TOKENS.palette.merah};
      --color-oranye: ${TOKENS.palette.oranye};
      --color-kuning: ${TOKENS.palette.kuning};
      --color-hijau: ${TOKENS.palette.hijau};
      --color-biru: ${TOKENS.palette.biru};
      --color-ungu: ${TOKENS.palette.ungu};
      --color-pink: ${TOKENS.palette.pink};
      --color-tosca: ${TOKENS.palette.tosca};

      /* Objek Gambar */
      --obj-stroke: ${TOKENS.object.strokeColor};
      --obj-stroke-width: ${TOKENS.object.strokeWidth}px;
      --obj-silhouette: ${TOKENS.object.silhouetteColor};
      --obj-outline-fill: ${TOKENS.object.outlineFill};

      /* Chrome Netral */
      --app-bg: ${TOKENS.chrome.bg};
      --app-surface: #FFFFFF;
      --app-text: ${TOKENS.chrome.textMain};
      --app-text-muted: ${TOKENS.chrome.textMuted};
      --app-border: ${TOKENS.chrome.cardBorder};
      --app-shadow: ${TOKENS.chrome.shadowOffset};
      --app-shadow-sm: ${TOKENS.chrome.shadowOffsetSm};
      --work-area-bg: #FFFFFF; /* Selalu putih di mode terang maupun gelap */

      /* Ergonomi & Ukuran Sentuh */
      --min-touch-target: ${TOKENS.touch.minTargetSize}px;

      /* Radius */
      --radius-sm: ${TOKENS.radius.sm}px;
      --radius-md: ${TOKENS.radius.md}px;
      --radius-lg: ${TOKENS.radius.lg}px;
      --radius-xl: ${TOKENS.radius.xl}px;
      --radius-full: ${TOKENS.radius.full}px;

      /* Tipografi */
      --font-family: ${TOKENS.typography.fontFamily};
      --font-sm: ${TOKENS.typography.sizeSm}px;
      --font-base: ${TOKENS.typography.sizeBase}px;
      --font-lg: ${TOKENS.typography.sizeLg}px;
      --font-xl: ${TOKENS.typography.sizeXl}px;
      --font-heading: ${TOKENS.typography.sizeHeading}px;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --app-bg: ${TOKENS.chrome.bgDark};
        --app-surface: ${TOKENS.chrome.surfaceDark};
        --app-text: ${TOKENS.chrome.textMainDark};
        --app-text-muted: ${TOKENS.chrome.textMutedDark};
        --app-border: ${TOKENS.chrome.cardBorderDark};
        --app-shadow: ${TOKENS.chrome.shadowOffsetDark};
        --app-shadow-sm: ${TOKENS.chrome.shadowOffsetSmDark};
        /* Area kerja tempat objek gambar tetap putih murni seperti kertas */
        --work-area-bg: #FFFFFF;
      }
    }
  `;
}

/**
 * Menyuntikkan CSS variables ke dalam <head>
 */
export function injectTokens(): void {
  if (typeof document === 'undefined') return;
  const styleId = 'theme-tokens-styles';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.prepend(styleEl);
  }
  styleEl.textContent = getCssVariablesString();
}
