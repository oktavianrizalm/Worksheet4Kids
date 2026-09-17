import { GraphicObjectDefinition, ObjectId } from './types';

export const GRAPHIC_OBJECTS: Record<ObjectId, GraphicObjectDefinition> = {
  // ==========================================
  // 6 BENTUK DASAR
  // ==========================================
  lingkaran: {
    id: 'lingkaran',
    name: 'Lingkaran',
    category: 'bentuk',
    parts: [
      {
        tag: 'circle',
        attrs: { cx: 50, cy: 50, r: 36 },
        role: 'primary',
      },
    ],
  },

  kotak: {
    id: 'kotak',
    name: 'Kotak',
    category: 'bentuk',
    parts: [
      {
        tag: 'rect',
        attrs: { x: 14, y: 14, width: 72, height: 72, rx: 12, ry: 12 },
        role: 'primary',
      },
    ],
  },

  segitiga: {
    id: 'segitiga',
    name: 'Segitiga',
    category: 'bentuk',
    parts: [
      {
        tag: 'path',
        attrs: {
          d: 'M 45 20 Q 50 12 55 20 L 82 72 Q 87 82 78 82 L 22 82 Q 13 82 18 72 Z',
        },
        role: 'primary',
      },
    ],
  },

  bintang: {
    id: 'bintang',
    name: 'Bintang',
    category: 'bentuk',
    parts: [
      {
        tag: 'path',
        attrs: {
          d: 'M 50 14 L 60 36 L 85 38 L 66 54 L 72 78 L 50 66 L 28 78 L 34 54 L 15 38 L 40 36 Z',
        },
        role: 'primary',
      },
    ],
  },

  hati: {
    id: 'hati',
    name: 'Hati',
    category: 'bentuk',
    parts: [
      {
        tag: 'path',
        attrs: {
          d: 'M 50 32 C 50 16 22 14 20 38 C 18 60 48 78 50 82 C 52 78 82 60 80 38 C 78 14 50 16 50 32 Z',
        },
        role: 'primary',
      },
    ],
  },

  ketupat: {
    id: 'ketupat',
    name: 'Ketupat',
    category: 'bentuk',
    parts: [
      {
        tag: 'path',
        attrs: {
          d: 'M 44 18 Q 50 12 56 18 L 82 44 Q 88 50 82 56 L 56 82 Q 50 88 44 82 L 18 56 Q 12 50 18 44 Z',
        },
        role: 'primary',
      },
    ],
  },

  // ==========================================
  // 22 BENDA
  // ==========================================
  apel: {
    id: 'apel',
    name: 'Apel',
    category: 'benda',
    parts: [
      // Tangkai apel
      {
        tag: 'path',
        attrs: {
          d: 'M 50 32 C 50 20 56 14 62 14',
        },
        role: 'accent',
        accentColor: '#8D5B4C',
      },
      // Daun apel
      {
        tag: 'path',
        attrs: {
          d: 'M 52 24 C 62 18 70 20 72 25 C 68 32 58 31 52 24 Z',
        },
        role: 'accent',
        accentColor: '#4CB84C',
      },
      // Tubuh apel
      {
        tag: 'path',
        attrs: {
          d: 'M 50 36 C 42 26 22 26 18 46 C 14 66 32 84 46 84 C 48 84 50 82 50 82 C 50 82 52 84 54 84 C 68 84 86 66 82 46 C 78 26 58 26 50 36 Z',
        },
        role: 'primary',
      },
    ],
  },

  balon: {
    id: 'balon',
    name: 'Balon',
    category: 'benda',
    parts: [
      // Tali balon (garis detail)
      {
        tag: 'path',
        attrs: {
          d: 'M 50 78 Q 44 84 52 88 T 48 95',
        },
        role: 'detail-stroke',
      },
      // Simpul balon
      {
        tag: 'polygon',
        attrs: {
          points: '46,74 54,74 50,78',
        },
        role: 'primary',
      },
      // Badan balon
      {
        tag: 'ellipse',
        attrs: {
          cx: 50,
          cy: 42,
          rx: 28,
          ry: 33,
        },
        role: 'primary',
      },
    ],
  },

  ikan: {
    id: 'ikan',
    name: 'Ikan',
    category: 'benda',
    parts: [
      // Ekor dan badan ikan
      {
        tag: 'path',
        attrs: {
          d: 'M 74 50 C 62 32 30 32 18 48 L 10 36 L 12 64 L 18 52 C 30 68 62 68 74 50 Z',
        },
        role: 'primary',
      },
      // Sirip atas
      {
        tag: 'path',
        attrs: {
          d: 'M 38 37 C 42 26 52 28 56 37',
        },
        role: 'primary',
      },
      // Mata ikan
      {
        tag: 'circle',
        attrs: {
          cx: 62,
          cy: 46,
          r: 3.5,
        },
        role: 'detail-fill',
        detailColor: '#22232E',
      },
    ],
  },

  kupu_kupu: {
    id: 'kupu_kupu',
    name: 'Kupu-kupu',
    category: 'benda',
    parts: [
      // Sayap kiri
      {
        tag: 'path',
        attrs: {
          d: 'M 48 50 C 32 24 14 26 14 46 C 14 58 32 60 48 54 C 32 62 24 78 36 80 C 44 81 48 66 48 54 Z',
        },
        role: 'primary',
      },
      // Sayap kanan
      {
        tag: 'path',
        attrs: {
          d: 'M 52 50 C 68 24 86 26 86 46 C 86 58 68 60 52 54 C 68 62 76 78 64 80 C 56 81 52 66 52 54 Z',
        },
        role: 'primary',
      },
      // Tubuh tengah
      {
        tag: 'rect',
        attrs: {
          x: 47,
          y: 34,
          width: 6,
          height: 38,
          rx: 3,
        },
        role: 'accent',
        accentColor: '#374151',
      },
      // Antena
      {
        tag: 'path',
        attrs: {
          d: 'M 47 36 C 40 24 32 24 32 26 M 53 36 C 60 24 68 24 68 26',
        },
        role: 'detail-stroke',
      },
    ],
  },

  matahari: {
    id: 'matahari',
    name: 'Matahari',
    category: 'benda',
    parts: [
      // Sinar matahari chunky (8 sinar)
      {
        tag: 'path',
        attrs: {
          d: 'M 50 10 L 50 20 M 50 80 L 50 90 M 10 50 L 20 50 M 80 50 L 90 50 M 22 22 L 29 29 M 71 71 L 78 78 M 78 22 L 71 29 M 22 78 L 29 71',
        },
        role: 'detail-stroke',
      },
      // Piringan matahari
      {
        tag: 'circle',
        attrs: {
          cx: 50,
          cy: 50,
          r: 22,
        },
        role: 'primary',
      },
    ],
  },

  awan: {
    id: 'awan',
    name: 'Awan',
    category: 'benda',
    parts: [
      // Bentuk kontur awan terpadu (single continuous cloud path)
      {
        tag: 'path',
        attrs: {
          d: 'M 26 68 L 74 68 C 84 68 88 58 82 50 C 86 40 78 32 68 34 C 62 22 46 22 40 32 C 34 30 24 36 26 48 C 16 52 16 68 26 68 Z',
        },
        role: 'primary',
      },
    ],
  },

  pohon: {
    id: 'pohon',
    name: 'Pohon',
    category: 'benda',
    parts: [
      // Batang pohon
      {
        tag: 'rect',
        attrs: {
          x: 43,
          y: 60,
          width: 14,
          height: 28,
          rx: 3,
        },
        role: 'accent',
        accentColor: '#8D5B4C',
      },
      // Tajuk daun
      {
        tag: 'path',
        attrs: {
          d: 'M 50 14 C 66 14 78 26 76 42 C 84 46 84 60 74 64 C 68 66 32 66 26 64 C 16 60 16 46 24 42 C 22 26 34 14 50 14 Z',
        },
        role: 'primary',
      },
    ],
  },

  rumah: {
    id: 'rumah',
    name: 'Rumah',
    category: 'benda',
    parts: [
      // Badan rumah
      {
        tag: 'rect',
        attrs: {
          x: 24,
          y: 44,
          width: 52,
          height: 44,
          rx: 4,
        },
        role: 'primary',
      },
      // Atap rumah
      {
        tag: 'polygon',
        attrs: {
          points: '18,46 50,16 82,46',
        },
        role: 'accent',
        accentColor: '#E8332F',
      },
      // Pintu
      {
        tag: 'rect',
        attrs: {
          x: 43,
          y: 62,
          width: 14,
          height: 26,
          rx: 2,
        },
        role: 'detail-fill',
        detailColor: '#8D5B4C',
      },
      // Jendela
      {
        tag: 'rect',
        attrs: {
          x: 58,
          y: 52,
          width: 12,
          height: 12,
          rx: 2,
        },
        role: 'detail-fill',
        detailColor: '#FDCB1E',
      },
    ],
  },

  mobil: {
    id: 'mobil',
    name: 'Mobil',
    category: 'benda',
    parts: [
      // Bodi mobil
      {
        tag: 'path',
        attrs: {
          d: 'M 16 64 L 16 54 C 16 50 24 48 30 42 L 38 30 C 40 26 46 26 62 26 L 72 42 L 84 46 C 88 48 88 54 88 64 L 88 68 L 16 68 Z',
        },
        role: 'primary',
      },
      // Jendela mobil
      {
        tag: 'path',
        attrs: {
          d: 'M 40 32 L 60 32 L 70 42 L 32 42 Z',
        },
        role: 'detail-fill',
        detailColor: '#E0F2FE',
      },
      // Roda kiri
      {
        tag: 'circle',
        attrs: {
          cx: 32,
          cy: 68,
          r: 10,
        },
        role: 'accent',
        accentColor: '#374151',
      },
      // Pelek kiri
      {
        tag: 'circle',
        attrs: {
          cx: 32,
          cy: 68,
          r: 4,
        },
        role: 'detail-fill',
        detailColor: '#E5E7EB',
      },
      // Roda kanan
      {
        tag: 'circle',
        attrs: {
          cx: 72,
          cy: 68,
          r: 10,
        },
        role: 'accent',
        accentColor: '#374151',
      },
      // Pelek kanan
      {
        tag: 'circle',
        attrs: {
          cx: 72,
          cy: 68,
          r: 4,
        },
        role: 'detail-fill',
        detailColor: '#E5E7EB',
      },
    ],
  },

  gelas: {
    id: 'gelas',
    name: 'Gelas',
    category: 'benda',
    parts: [
      // Gagang gelas di sebelah kanan
      {
        tag: 'path',
        attrs: {
          d: 'M 66 38 C 82 38 82 66 66 66',
        },
        role: 'detail-stroke',
      },
      // Badan gelas
      {
        tag: 'path',
        attrs: {
          d: 'M 26 24 L 32 76 C 33 82 38 86 46 86 L 56 86 C 64 86 69 82 70 76 L 76 24 Z',
        },
        role: 'primary',
      },
      // Bibir gelas atas
      {
        tag: 'ellipse',
        attrs: {
          cx: 51,
          cy: 24,
          rx: 25,
          ry: 6,
        },
        role: 'accent',
        accentColor: '#E5E7EB',
      },
    ],
  },

  es_krim: {
    id: 'es_krim',
    name: 'Es Krim',
    category: 'benda',
    parts: [
      // Kerucut cone
      {
        tag: 'polygon',
        attrs: {
          points: '32,50 68,50 50,90',
        },
        role: 'accent',
        accentColor: '#E6A868',
      },
      // Garis wafel cone
      {
        tag: 'path',
        attrs: {
          d: 'M 38 58 L 58 76 M 62 58 L 42 76',
        },
        role: 'detail-stroke',
      },
      // Sendok es krim (scoop)
      {
        tag: 'path',
        attrs: {
          d: 'M 28 50 C 18 50 20 36 30 30 C 32 18 48 16 56 22 C 64 18 76 24 74 36 C 82 40 80 50 68 50 Z',
        },
        role: 'primary',
      },
    ],
  },

  payung: {
    id: 'payung',
    name: 'Payung',
    category: 'benda',
    parts: [
      // Ujung payung atas
      {
        tag: 'line',
        attrs: {
          x1: 50,
          y1: 10,
          x2: 50,
          y2: 18,
        },
        role: 'accent',
        accentColor: '#4B5563',
      },
      // Kanopi kubah payung
      {
        tag: 'path',
        attrs: {
          d: 'M 14 54 C 14 28 30 18 50 18 C 70 18 86 28 86 54 C 77 50 69 50 62 54 C 55 50 45 50 38 54 C 31 50 23 50 14 54 Z',
        },
        role: 'primary',
      },
      // Gagang lengkung J
      {
        tag: 'path',
        attrs: {
          d: 'M 50 54 L 50 80 C 50 86 44 88 40 84 C 36 80 40 76 44 76',
        },
        role: 'detail-stroke',
      },
    ],
  },

  bola: {
    id: 'bola',
    name: 'Bola',
    category: 'benda',
    parts: [
      // Bola dasar bulat
      {
        tag: 'circle',
        attrs: {
          cx: 50,
          cy: 50,
          r: 36,
        },
        role: 'primary',
      },
      // Garis lengkung jahitan bola
      {
        tag: 'path',
        attrs: {
          d: 'M 50 14 C 30 26 30 74 50 86',
        },
        role: 'detail-stroke',
      },
      {
        tag: 'path',
        attrs: {
          d: 'M 50 14 C 70 26 70 74 50 86',
        },
        role: 'detail-stroke',
      },
      {
        tag: 'line',
        attrs: {
          x1: 14,
          y1: 50,
          x2: 86,
          y2: 50,
        },
        role: 'detail-stroke',
      },
    ],
  },

  daun: {
    id: 'daun',
    name: 'Daun',
    category: 'benda',
    parts: [
      // Helaian daun
      {
        tag: 'path',
        attrs: {
          d: 'M 24 76 C 24 40 45 20 78 18 C 76 52 56 76 24 76 Z',
        },
        role: 'primary',
      },
      // Tulang daun
      {
        tag: 'path',
        attrs: {
          d: 'M 16 84 C 20 80 24 76 34 66 C 46 54 58 40 74 22',
        },
        role: 'detail-stroke',
      },
    ],
  },

  perahu: {
    id: 'perahu',
    name: 'Perahu',
    category: 'benda',
    parts: [
      // Tiang layar
      {
        tag: 'line',
        attrs: {
          x1: 48,
          y1: 20,
          x2: 48,
          y2: 66,
        },
        role: 'accent',
        accentColor: '#8D5B4C',
      },
      // Layar perahu
      {
        tag: 'polygon',
        attrs: {
          points: '52,22 52,60 82,60',
        },
        role: 'accent',
        accentColor: '#FFFFFF',
      },
      // Lambung perahu
      {
        tag: 'path',
        attrs: {
          d: 'M 14 66 L 86 66 L 76 84 L 24 84 Z',
        },
        role: 'primary',
      },
    ],
  },

  jamur: {
    id: 'jamur',
    name: 'Jamur',
    category: 'benda',
    parts: [
      // Batang jamur
      {
        tag: 'path',
        attrs: {
          d: 'M 40 52 L 38 82 C 38 88 62 88 62 82 L 60 52 Z',
        },
        role: 'accent',
        accentColor: '#F3F4F6',
      },
      // Payung / tudung jamur
      {
        tag: 'path',
        attrs: {
          d: 'M 18 52 C 18 28 32 18 50 18 C 68 18 82 28 82 52 Z',
        },
        role: 'primary',
      },
      // Bintik putih pada jamur
      {
        tag: 'circle',
        attrs: {
          cx: 36,
          cy: 36,
          r: 5,
        },
        role: 'detail-fill',
        detailColor: '#FFFFFF',
      },
      {
        tag: 'circle',
        attrs: {
          cx: 52,
          cy: 28,
          r: 6,
        },
        role: 'detail-fill',
        detailColor: '#FFFFFF',
      },
      {
        tag: 'circle',
        attrs: {
          cx: 66,
          cy: 38,
          r: 5,
        },
        role: 'detail-fill',
        detailColor: '#FFFFFF',
      },
    ],
  },

  topi: {
    id: 'topi',
    name: 'Topi',
    category: 'benda',
    parts: [
      // Kubah topi
      {
        tag: 'path',
        attrs: {
          d: 'M 28 62 C 28 32 40 24 50 24 C 60 24 72 32 72 62 Z',
        },
        role: 'primary',
      },
      // Pinggiran topi membulat
      {
        tag: 'path',
        attrs: {
          d: 'M 14 62 C 14 56 86 56 86 62 C 86 70 14 70 14 62 Z',
        },
        role: 'primary',
      },
      // Pita topi
      {
        tag: 'path',
        attrs: {
          d: 'M 28 52 C 38 50 62 50 72 52 L 72 58 C 62 56 38 56 28 58 Z',
        },
        role: 'accent',
        accentColor: '#FDCB1E',
      },
    ],
  },

  kue: {
    id: 'kue',
    name: 'Kue',
    category: 'benda',
    parts: [
      // Badan kue
      {
        tag: 'rect',
        attrs: {
          x: 22,
          y: 48,
          width: 56,
          height: 38,
          rx: 6,
        },
        role: 'primary',
      },
      // Lapisan gula leleh
      {
        tag: 'path',
        attrs: {
          d: 'M 22 56 C 28 62 34 54 40 60 C 46 64 52 54 58 60 C 64 64 70 56 78 56 L 78 48 L 22 48 Z',
        },
        role: 'accent',
        accentColor: '#FFFFFF',
      },
      // Lilin
      {
        tag: 'rect',
        attrs: {
          x: 47,
          y: 28,
          width: 6,
          height: 20,
          rx: 2,
        },
        role: 'accent',
        accentColor: '#2B80D9',
      },
      // Api lilin
      {
        tag: 'path',
        attrs: {
          d: 'M 50 16 C 46 20 47 24 50 28 C 53 24 54 20 50 16 Z',
        },
        role: 'detail-fill',
        detailColor: '#FDCB1E',
      },
    ],
  },

  telur: {
    id: 'telur',
    name: 'Telur',
    category: 'benda',
    parts: [
      {
        tag: 'path',
        attrs: {
          d: 'M 50 16 C 66 16 80 44 80 60 C 80 76 66 84 50 84 C 34 84 20 76 20 60 C 20 44 34 16 50 16 Z',
        },
        role: 'primary',
      },
    ],
  },

  bunga: {
    id: 'bunga',
    name: 'Bunga',
    category: 'benda',
    parts: [
      // Batang bunga
      {
        tag: 'line',
        attrs: {
          x1: 50,
          y1: 52,
          x2: 50,
          y2: 88,
        },
        role: 'accent',
        accentColor: '#4CB84C',
      },
      // Daun tangkai
      {
        tag: 'path',
        attrs: {
          d: 'M 50 72 C 62 66 66 74 58 78 C 53 80 50 77 50 72 Z',
        },
        role: 'accent',
        accentColor: '#4CB84C',
      },
      // 5 Kelopak bunga
      {
        tag: 'circle',
        attrs: { cx: 50, cy: 26, r: 12 },
        role: 'primary',
      },
      {
        tag: 'circle',
        attrs: { cx: 68, cy: 38, r: 12 },
        role: 'primary',
      },
      {
        tag: 'circle',
        attrs: { cx: 61, cy: 58, r: 12 },
        role: 'primary',
      },
      {
        tag: 'circle',
        attrs: { cx: 39, cy: 58, r: 12 },
        role: 'primary',
      },
      {
        tag: 'circle',
        attrs: { cx: 32, cy: 38, r: 12 },
        role: 'primary',
      },
      // Inti putik bunga
      {
        tag: 'circle',
        attrs: { cx: 50, cy: 44, r: 9 },
        role: 'accent',
        accentColor: '#FDCB1E',
      },
    ],
  },

  bulan: {
    id: 'bulan',
    name: 'Bulan',
    category: 'benda',
    parts: [
      {
        tag: 'path',
        attrs: {
          d: 'M 64 16 C 40 22 26 44 32 68 C 36 80 46 88 58 88 C 42 84 36 62 44 44 C 48 34 56 24 64 16 Z',
        },
        role: 'primary',
      },
    ],
  },

  kunci: {
    id: 'kunci',
    name: 'Kunci',
    category: 'benda',
    parts: [
      // Kepala kunci luar
      {
        tag: 'circle',
        attrs: {
          cx: 26,
          cy: 50,
          r: 16,
        },
        role: 'primary',
      },
      // Lubang kepala kunci
      {
        tag: 'circle',
        attrs: {
          cx: 26,
          cy: 50,
          r: 7,
        },
        role: 'detail-fill',
        detailColor: '#FFFFFF',
      },
      // Batang kunci
      {
        tag: 'rect',
        attrs: {
          x: 38,
          y: 46,
          width: 44,
          height: 8,
          rx: 3,
        },
        role: 'primary',
      },
      // Gerigi 1
      {
        tag: 'rect',
        attrs: {
          x: 64,
          y: 54,
          width: 6,
          height: 12,
          rx: 2,
        },
        role: 'primary',
      },
      // Gerigi 2
      {
        tag: 'rect',
        attrs: {
          x: 74,
          y: 54,
          width: 6,
          height: 16,
          rx: 2,
        },
        role: 'primary',
      },
    ],
  },
};

export const ALL_OBJECT_IDS = Object.keys(GRAPHIC_OBJECTS) as ObjectId[];
