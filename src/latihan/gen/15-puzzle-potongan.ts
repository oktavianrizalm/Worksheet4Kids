import { GeneratorLatihan, Soal, PotonganPuzzle, DataPuzzle } from '../tipe';
import { PRNG } from '../../random/prng';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { ObjectId } from '../../graphics/types';
import { GRAPHIC_OBJECTS } from '../../graphics/objects';

interface Point {
  x: number;
  y: number;
}

/**
 * Menghasilkan segmen path SVG dari p1 ke p2 dengan tab interlocking jigsaw.
 * sign = 0: tepi lurus rata (batas luar papan)
 * sign = 1: tab menonjol keluar ke arah kanan relatif terhadap arah perjalanan p1->p2
 * sign = -1: lekukan masuk (notch)
 */
function jigsawEdge(p1: Point, p2: Point, sign: number): string {
  if (sign === 0) {
    return `L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const L = Math.hypot(dx, dy);
  if (L === 0) return `L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;

  const tx = dx / L;
  const ty = dy / L;
  // Normal ke kanan relatif terhadap arah: (ty, -tx)
  const nx = ty;
  const ny = -tx;

  const toWorld = (s: number, h: number): Point => ({
    x: p1.x + s * tx + h * sign * nx,
    y: p1.y + s * ty + h * sign * ny,
  });

  const m = L / 2;
  const tabW = Math.min(22, L * 0.18);
  const tabH = Math.min(24, L * 0.2);
  const headW = tabW * 1.35;

  const ptNeck1 = toWorld(m - tabW, 0);
  const ptNeck2 = toWorld(m - tabW * 0.7, tabH * 0.2);
  const ptHead1 = toWorld(m - headW, tabH * 0.75);
  const ptHeadTop = toWorld(m, tabH);
  const ptHead2 = toWorld(m + headW, tabH * 0.75);
  const ptNeck3 = toWorld(m + tabW * 0.7, tabH * 0.2);
  const ptNeck4 = toWorld(m + tabW, 0);

  return [
    `L ${ptNeck1.x.toFixed(1)} ${ptNeck1.y.toFixed(1)}`,
    `C ${ptNeck2.x.toFixed(1)} ${ptNeck2.y.toFixed(1)}, ${ptHead1.x.toFixed(1)} ${ptHead1.y.toFixed(1)}, ${ptHeadTop.x.toFixed(1)} ${ptHeadTop.y.toFixed(1)}`,
    `C ${ptHead2.x.toFixed(1)} ${ptHead2.y.toFixed(1)}, ${ptNeck3.x.toFixed(1)} ${ptNeck3.y.toFixed(1)}, ${ptNeck4.x.toFixed(1)} ${ptNeck4.y.toFixed(1)}`,
    `L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`,
  ].join(' ');
}

export const UKURAN_PAPAN_PUZZLE = 240;

/**
 * Menghasilkan potongan puzzle 2-potong (split kiri & kanan)
 */
function buatPotongan2(): readonly PotonganPuzzle[] {
  const W = UKURAN_PAPAN_PUZZLE;
  const H = UKURAN_PAPAN_PUZZLE;
  const midX = W / 2;

  // Potongan 0: Kiri
  const path0 = [
    `M 0 0`,
    jigsawEdge({ x: 0, y: 0 }, { x: midX, y: 0 }, 0),
    jigsawEdge({ x: midX, y: 0 }, { x: midX, y: H }, 1),
    jigsawEdge({ x: midX, y: H }, { x: 0, y: H }, 0),
    jigsawEdge({ x: 0, y: H }, { x: 0, y: 0 }, 0),
    'Z',
  ].join(' ');

  // Potongan 1: Kanan
  const path1 = [
    `M ${midX} 0`,
    jigsawEdge({ x: midX, y: 0 }, { x: W, y: 0 }, 0),
    jigsawEdge({ x: W, y: 0 }, { x: W, y: H }, 0),
    jigsawEdge({ x: W, y: H }, { x: midX, y: H }, 0),
    jigsawEdge({ x: midX, y: H }, { x: midX, y: 0 }, -1),
    'Z',
  ].join(' ');

  return [
    {
      id: 'p-0',
      slotIndex: 0,
      pathClip: path0,
      x: 0,
      y: 0,
      w: midX + 24,
      h: H,
      center: { x: midX / 2, y: H / 2 },
    },
    {
      id: 'p-1',
      slotIndex: 1,
      pathClip: path1,
      x: midX - 24,
      y: 0,
      w: midX + 24,
      h: H,
      center: { x: midX + midX / 2, y: H / 2 },
    },
  ];
}

/**
 * Menghasilkan potongan puzzle 3-potong (3 kolom vertikal)
 */
function buatPotongan3(): readonly PotonganPuzzle[] {
  const W = UKURAN_PAPAN_PUZZLE;
  const H = UKURAN_PAPAN_PUZZLE;
  const x1 = W / 3;
  const x2 = (W * 2) / 3;

  // Potongan 0: Kiri
  const path0 = [
    `M 0 0`,
    jigsawEdge({ x: 0, y: 0 }, { x: x1, y: 0 }, 0),
    jigsawEdge({ x: x1, y: 0 }, { x: x1, y: H }, 1),
    jigsawEdge({ x: x1, y: H }, { x: 0, y: H }, 0),
    jigsawEdge({ x: 0, y: H }, { x: 0, y: 0 }, 0),
    'Z',
  ].join(' ');

  // Potongan 1: Tengah
  const path1 = [
    `M ${x1} 0`,
    jigsawEdge({ x: x1, y: 0 }, { x: x2, y: 0 }, 0),
    jigsawEdge({ x: x2, y: 0 }, { x: x2, y: H }, 1),
    jigsawEdge({ x: x2, y: H }, { x: x1, y: H }, 0),
    jigsawEdge({ x: x1, y: H }, { x: x1, y: 0 }, -1),
    'Z',
  ].join(' ');

  // Potongan 2: Kanan
  const path2 = [
    `M ${x2} 0`,
    jigsawEdge({ x: x2, y: 0 }, { x: W, y: 0 }, 0),
    jigsawEdge({ x: W, y: 0 }, { x: W, y: H }, 0),
    jigsawEdge({ x: W, y: H }, { x: x2, y: H }, 0),
    jigsawEdge({ x: x2, y: H }, { x: x2, y: 0 }, -1),
    'Z',
  ].join(' ');

  return [
    {
      id: 'p-0',
      slotIndex: 0,
      pathClip: path0,
      x: 0,
      y: 0,
      w: x1 + 22,
      h: H,
      center: { x: x1 / 2, y: H / 2 },
    },
    {
      id: 'p-1',
      slotIndex: 1,
      pathClip: path1,
      x: x1 - 22,
      y: 0,
      w: x1 + 44,
      h: H,
      center: { x: (x1 + x2) / 2, y: H / 2 },
    },
    {
      id: 'p-2',
      slotIndex: 2,
      pathClip: path2,
      x: x2 - 22,
      y: 0,
      w: x1 + 22,
      h: H,
      center: { x: (x2 + W) / 2, y: H / 2 },
    },
  ];
}

/**
 * Menghasilkan potongan puzzle 4-potong (2x2 grid kuadran)
 */
function buatPotongan4(): readonly PotonganPuzzle[] {
  const W = UKURAN_PAPAN_PUZZLE;
  const H = UKURAN_PAPAN_PUZZLE;
  const midX = W / 2;
  const midY = H / 2;

  // Potongan 0: Atas-Kiri
  const path0 = [
    `M 0 0`,
    jigsawEdge({ x: 0, y: 0 }, { x: midX, y: 0 }, 0),
    jigsawEdge({ x: midX, y: 0 }, { x: midX, y: midY }, 1), // tab ke kanan
    jigsawEdge({ x: midX, y: midY }, { x: 0, y: midY }, 1), // tab ke bawah
    jigsawEdge({ x: 0, y: midY }, { x: 0, y: 0 }, 0),
    'Z',
  ].join(' ');

  // Potongan 1: Atas-Kanan
  const path1 = [
    `M ${midX} 0`,
    jigsawEdge({ x: midX, y: 0 }, { x: W, y: 0 }, 0),
    jigsawEdge({ x: W, y: 0 }, { x: W, y: midY }, 0),
    jigsawEdge({ x: W, y: midY }, { x: midX, y: midY }, 1), // tab ke bawah
    jigsawEdge({ x: midX, y: midY }, { x: midX, y: 0 }, -1), // notch dari p0
    'Z',
  ].join(' ');

  // Potongan 2: Bawah-Kiri
  const path2 = [
    `M 0 ${midY}`,
    jigsawEdge({ x: 0, y: midY }, { x: midX, y: midY }, -1), // notch dari p0
    jigsawEdge({ x: midX, y: midY }, { x: midX, y: H }, 1), // tab ke kanan
    jigsawEdge({ x: midX, y: H }, { x: 0, y: H }, 0),
    jigsawEdge({ x: 0, y: H }, { x: 0, y: midY }, 0),
    'Z',
  ].join(' ');

  // Potongan 3: Bawah-Kanan
  const path3 = [
    `M ${midX} ${midY}`,
    jigsawEdge({ x: midX, y: midY }, { x: W, y: midY }, -1), // notch dari p1
    jigsawEdge({ x: W, y: midY }, { x: W, y: H }, 0),
    jigsawEdge({ x: W, y: H }, { x: midX, y: H }, 0),
    jigsawEdge({ x: midX, y: H }, { x: midX, y: midY }, -1), // notch dari p2
    'Z',
  ].join(' ');

  return [
    {
      id: 'p-0',
      slotIndex: 0,
      pathClip: path0,
      x: 0,
      y: 0,
      w: midX + 22,
      h: midY + 22,
      center: { x: midX / 2, y: midY / 2 },
    },
    {
      id: 'p-1',
      slotIndex: 1,
      pathClip: path1,
      x: midX - 22,
      y: 0,
      w: midX + 22,
      h: midY + 22,
      center: { x: midX + midX / 2, y: midY / 2 },
    },
    {
      id: 'p-2',
      slotIndex: 2,
      pathClip: path2,
      x: 0,
      y: midY - 22,
      w: midX + 22,
      h: midY + 22,
      center: { x: midX / 2, y: midY + midY / 2 },
    },
    {
      id: 'p-3',
      slotIndex: 3,
      pathClip: path3,
      x: midX - 22,
      y: midY - 22,
      w: midX + 22,
      h: midY + 22,
      center: { x: midX + midX / 2, y: midY + midY / 2 },
    },
  ];
}

const DAFTAR_OBJEK_PUZZLE: readonly ObjectId[] = [
  'mobil',
  'kupu_kupu',
  'ikan',
  'apel',
  'balon',
  'pohon',
  'rumah',
  'perahu',
  'es_krim',
  'kue',
  'matahari',
  'bunga',
  'bintang',
  'payung',
  'topi',
  'jamur',
  'kunci',
  'bola',
  'telur',
  'daun',
  'hati',
  'bulan',
] as const;

/**
 * Generator Latihan #15: Puzzle Potongan Sederhana
 * - Mengasah persepsi visual part-to-whole, orientasi spasial, dan koordinasi motorik anak 4-5 tahun.
 * - Memiliki variasi tingkat kesulitan lembut: 2 potongan, 3 potongan, dan 4 potongan kuadran.
 */
export const generatorPuzzlePotongan: GeneratorLatihan = {
  id: 'puzzle-potongan',
  judul: 'Puzzle Potongan',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih objek yang ramah anak
    const objek = rng.pick(DAFTAR_OBJEK_PUZZLE);
    const warna = rng.pick(SEMUA_WARNA_PALET);
    const namaObjek = GRAPHIC_OBJECTS[objek]?.name ?? 'Gambar Ceria';

    // 2. Pilih tipe potongan: 2-potong, 3-potong, atau 4-potong
    const jenisTipe = rng.pick(['2-potong', '3-potong', '4-potong'] as const);

    let potongan: readonly PotonganPuzzle[];
    let labelTipe: string;

    if (jenisTipe === '2-potong') {
      potongan = buatPotongan2();
      labelTipe = '2 Potongan';
    } else if (jenisTipe === '3-potong') {
      potongan = buatPotongan3();
      labelTipe = '3 Potongan';
    } else {
      potongan = buatPotongan4();
      labelTipe = '4 Potongan';
    }

    const dataPuzzle: DataPuzzle = {
      tipe: jenisTipe,
      labelTipe,
      ukuranPapan: { width: UKURAN_PAPAN_PUZZLE, height: UKURAN_PAPAN_PUZZLE },
      potongan,
      objek,
      warna,
      namaObjek,
    };

    return {
      idLatihan: 'puzzle-potongan',
      varian: 'default',
      instruksiTeks: `Pasang semua potongan ${namaObjek} ke dalam kotak agar utuh!`,
      audioId: 'puzzle-potongan.default',
      jumlahPilihan: 0,
      contoh: [],
      pilihan: [],
      objekUtama: objek,
      dataPuzzle,
    };
  },
};
