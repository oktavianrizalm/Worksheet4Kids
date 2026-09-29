import { GeneratorLatihan, Soal, JalurGaris } from '../tipe';
import { PRNG } from '../../random/prng';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { ObjectId } from '../../graphics/types';

export const CELL_W = 90;
export const CELL_H = 90;
export const ORIGIN_X = 130;
export const ORIGIN_Y = 85;
export const MAZE_COLS = 6;
export const MAZE_ROWS = 3;

export function getCellCenter(c: number, r: number): { x: number; y: number } {
  return {
    x: ORIGIN_X + c * CELL_W + CELL_W / 2,
    y: ORIGIN_Y + r * CELL_H + CELL_H / 2,
  };
}

function edgeKey(c1: number, r1: number, c2: number, r2: number): string {
  if (c1 > c2 || (c1 === c2 && r1 > r2)) {
    return `${c2},${r2}-${c1},${r1}`;
  }
  return `${c1},${r1}-${c2},${r2}`;
}

export interface TemaLabirin {
  readonly awal: ObjectId;
  readonly akhir: ObjectId;
  readonly namaKarakter: string;
  readonly namaTujuan: string;
}

export const TEMA_LABIRIN: readonly TemaLabirin[] = [
  { awal: 'mobil', akhir: 'rumah', namaKarakter: 'Mobil Ceria', namaTujuan: 'Rumah' },
  { awal: 'kupu_kupu', akhir: 'bunga', namaKarakter: 'Kupu-kupu Cantik', namaTujuan: 'Bunga Segar' },
  { awal: 'ikan', akhir: 'perahu', namaKarakter: 'Ikan Lincah', namaTujuan: 'Perahu Nelayan' },
  { awal: 'apel', akhir: 'pohon', namaKarakter: 'Apel Manis', namaTujuan: 'Pohon Rindang' },
  { awal: 'balon', akhir: 'awan', namaKarakter: 'Balon Udara', namaTujuan: 'Awan Biru' },
  { awal: 'kunci', akhir: 'rumah', namaKarakter: 'Kunci Ajaib', namaTujuan: 'Pintu Rumah' },
  { awal: 'bintang', akhir: 'bulan', namaKarakter: 'Bintang Kecil', namaTujuan: 'Bulan Sabit' },
  { awal: 'kue', akhir: 'gelas', namaKarakter: 'Kue Ulang Tahun', namaTujuan: 'Gelas Susu' },
  { awal: 'payung', akhir: 'rumah', namaKarakter: 'Payung Warna-warni', namaTujuan: 'Rumah Teduh' },
  { awal: 'es_krim', akhir: 'gelas', namaKarakter: 'Es Krim Lezat', namaTujuan: 'Gelas Ceria' },
  { awal: 'matahari', akhir: 'awan', namaKarakter: 'Matahari Pagi', namaTujuan: 'Awan Putih' },
  { awal: 'bola', akhir: 'kotak', namaKarakter: 'Bola Mainan', namaTujuan: 'Kotak Mainan' },
  { awal: 'hati', akhir: 'bunga', namaKarakter: 'Hati Kasih', namaTujuan: 'Taman Bunga' },
  { awal: 'perahu', akhir: 'rumah', namaKarakter: 'Perahu Layar', namaTujuan: 'Dermaga Rumah' },
  { awal: 'jamur', akhir: 'pohon', namaKarakter: 'Jamur Hutan', namaTujuan: 'Pohon Besar' },
  { awal: 'topi', akhir: 'mobil', namaKarakter: 'Topi Petualang', namaTujuan: 'Mobil Wisata' },
  { awal: 'telur', akhir: 'bunga', namaKarakter: 'Telur Emas', namaTujuan: 'Sarang Bunga' },
  { awal: 'daun', akhir: 'pohon', namaKarakter: 'Daun Hijau', namaTujuan: 'Pohon Rimbun' },
  { awal: 'bulan', akhir: 'bintang', namaKarakter: 'Bulan Purnama', namaTujuan: 'Bintang Kejora' },
  { awal: 'kotak', akhir: 'rumah', namaKarakter: 'Kotak Hadiah', namaTujuan: 'Rumah Pesta' },
] as const;

export interface MazeGridRaw {
  readonly nama: string;
  readonly start: readonly [number, number];
  readonly goal: readonly [number, number];
  readonly solution: readonly (readonly [number, number])[];
  readonly deadEnds: readonly (readonly (readonly [number, number])[])[];
}

export const DAFTAR_LAYOUT_GRID: readonly MazeGridRaw[] = [
  // 1. Lengkung Bawah
  {
    nama: 'Lengkung Bawah',
    start: [0, 0],
    goal: [5, 0],
    solution: [[0,0],[0,1],[0,2],[1,2],[2,2],[3,2],[3,1],[4,1],[5,1],[5,0]],
    deadEnds: [
      [[0,0],[1,0],[2,0]],
      [[2,2],[2,1],[1,1]],
      [[5,1],[5,2]],
    ],
  },
  // 2. Zigzag Klasik
  {
    nama: 'Zigzag Klasik',
    start: [0, 0],
    goal: [5, 2],
    solution: [[0,0],[1,0],[2,0],[2,1],[1,1],[1,2],[2,2],[3,2],[4,2],[5,2]],
    deadEnds: [
      [[2,0],[3,0],[4,0]],
      [[3,2],[3,1],[4,1]],
      [[5,2],[5,1],[5,0]],
    ],
  },
  // 3. Jalur Atas Melengkung
  {
    nama: 'Jalur Atas',
    start: [0, 2],
    goal: [5, 2],
    solution: [[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[3,1],[4,1],[4,2],[5,2]],
    deadEnds: [
      [[0,2],[1,2],[2,2]],
      [[3,0],[4,0],[5,0]],
      [[5,2],[5,1]],
    ],
  },
  // 4. Jembatan Tengah
  {
    nama: 'Jembatan Tengah',
    start: [0, 1],
    goal: [5, 1],
    solution: [[0,1],[0,0],[1,0],[2,0],[2,1],[3,1],[3,2],[4,2],[5,2],[5,1]],
    deadEnds: [
      [[0,1],[0,2],[1,2]],
      [[3,1],[4,1]],
      [[2,0],[3,0],[4,0]],
    ],
  },
  // 5. Lorong Putar
  {
    nama: 'Lorong Putar',
    start: [0, 0],
    goal: [3, 1],
    solution: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[5,1],[5,2],[4,2],[3,2],[2,2],[1,2],[1,1],[2,1],[3,1]],
    deadEnds: [
      [[0,0],[0,1],[0,2]],
      [[4,2],[4,1]],
    ],
  },
  // 6. Tangga Diagonal
  {
    nama: 'Tangga Diagonal',
    start: [0, 2],
    goal: [5, 0],
    solution: [[0,2],[1,2],[1,1],[2,1],[2,0],[3,0],[4,0],[4,1],[5,1],[5,0]],
    deadEnds: [
      [[1,2],[2,2],[3,2]],
      [[2,1],[3,1]],
      [[0,2],[0,1],[0,0]],
    ],
  },
  // 7. Pilihan Dua Lorong
  {
    nama: 'Dua Lorong',
    start: [0, 1],
    goal: [5, 1],
    solution: [[0,1],[1,1],[1,2],[2,2],[3,2],[4,2],[4,1],[5,1]],
    deadEnds: [
      [[1,1],[1,0],[2,0],[3,0],[4,0]],
      [[2,2],[2,1],[3,1]],
      [[5,1],[5,0]],
    ],
  },
  // 8. Gelombang Ular
  {
    nama: 'Gelombang Ular',
    start: [0, 0],
    goal: [5, 0],
    solution: [[0,0],[1,0],[1,1],[1,2],[2,2],[2,1],[3,1],[3,2],[4,2],[4,1],[4,0],[5,0]],
    deadEnds: [
      [[1,0],[2,0],[3,0]],
      [[0,0],[0,1],[0,2]],
      [[5,0],[5,1],[5,2]],
    ],
  },
  // 9. Menembus Benteng
  {
    nama: 'Menembus Benteng',
    start: [0, 2],
    goal: [5, 2],
    solution: [[0,2],[1,2],[1,1],[1,0],[2,0],[3,0],[4,0],[4,1],[3,1],[3,2],[4,2],[5,2]],
    deadEnds: [
      [[1,2],[2,2]],
      [[4,1],[5,1],[5,0]],
      [[0,2],[0,1]],
    ],
  },
  // 10. Lompatan Kelinci
  {
    nama: 'Lompatan Kelinci',
    start: [5, 0],
    goal: [0, 2],
    solution: [[5,0],[4,0],[3,0],[3,1],[2,1],[1,1],[1,2],[0,2]],
    deadEnds: [
      [[5,0],[5,1],[5,2],[4,2]],
      [[3,0],[2,0],[1,0],[0,0]],
      [[2,1],[2,2],[3,2]],
    ],
  },
  // 11. Taman Berbunga
  {
    nama: 'Taman Berbunga',
    start: [0, 0],
    goal: [5, 2],
    solution: [[0,0],[1,0],[1,1],[2,1],[3,1],[3,0],[4,0],[5,0],[5,1],[5,2]],
    deadEnds: [
      [[0,0],[0,1],[0,2],[1,2]],
      [[3,1],[3,2],[4,2]],
      [[2,1],[2,2]],
    ],
  },
  // 12. Labirin Pelangi
  {
    nama: 'Labirin Pelangi',
    start: [0, 1],
    goal: [5, 2],
    solution: [[0,1],[0,0],[1,0],[2,0],[2,1],[2,2],[3,2],[4,2],[4,1],[5,1],[5,2]],
    deadEnds: [
      [[0,1],[0,2],[1,2]],
      [[2,0],[3,0],[4,0],[5,0]],
      [[4,1],[3,1]],
    ],
  },
] as const;

export function kompilasiLabirin(grid: MazeGridRaw): {
  dSolusi: string;
  titikAwal: { x: number; y: number };
  titikAkhir: { x: number; y: number };
  dinding: string[];
} {
  const openEdges = new Set<string>();

  function registerPath(arr: readonly (readonly [number, number])[]) {
    for (let i = 0; i < arr.length - 1; i++) {
      openEdges.add(edgeKey(arr[i][0], arr[i][1], arr[i + 1][0], arr[i + 1][1]));
    }
  }

  registerPath(grid.solution);
  for (const de of grid.deadEnds) {
    registerPath(de);
  }

  const dinding: string[] = [];

  // Dinding vertikal dalam
  for (let c = 0; c < MAZE_COLS - 1; c++) {
    for (let r = 0; r < MAZE_ROWS; r++) {
      if (!openEdges.has(edgeKey(c, r, c + 1, r))) {
        const x = ORIGIN_X + (c + 1) * CELL_W;
        const y1 = ORIGIN_Y + r * CELL_H;
        const y2 = ORIGIN_Y + (r + 1) * CELL_H;
        dinding.push(`M ${x} ${y1} L ${x} ${y2}`);
      }
    }
  }

  // Dinding horizontal dalam
  for (let r = 0; r < MAZE_ROWS - 1; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      if (!openEdges.has(edgeKey(c, r, c, r + 1))) {
        const y = ORIGIN_Y + (r + 1) * CELL_H;
        const x1 = ORIGIN_X + c * CELL_W;
        const x2 = ORIGIN_X + (c + 1) * CELL_W;
        dinding.push(`M ${x1} ${y} L ${x2} ${y}`);
      }
    }
  }

  const solCenters = grid.solution.map(([c, r]) => getCellCenter(c, r));
  const dSolusi = 'M ' + solCenters.map((p) => `${p.x} ${p.y}`).join(' L ');
  const titikAwal = getCellCenter(grid.start[0], grid.start[1]);
  const titikAkhir = getCellCenter(grid.goal[0], grid.goal[1]);

  return { dSolusi, titikAwal, titikAkhir, dinding };
}

/**
 * Generator Latihan #14: Labirin Sederhana (Simple Maze Runner)
 * - Berbasis grid ortogonal matematika 6x3: dinding HANYA digambar pada batas yang buntu.
 * - Jalur solusi 100% bebas rintangan, tidak pernah memotong dinding.
 */
export const generatorLabirinSederhana: GeneratorLatihan = {
  id: 'labirin-sederhana',
  judul: 'Labirin Ceria',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih tema karakter awal dan objek tujuan
    const tema = rng.pick(TEMA_LABIRIN);

    // 2. Pilih salah satu variasi layout labirin
    const layoutRaw = rng.pick(DAFTAR_LAYOUT_GRID);
    const layout = kompilasiLabirin(layoutRaw);

    // 3. Pilih warna jalur ceria
    const warnaJalur = rng.pick(SEMUA_WARNA_PALET);

    const jalurGaris: JalurGaris = {
      d: layout.dSolusi,
      titikAwal: layout.titikAwal,
      titikAkhir: layout.titikAkhir,
      objekAwal: tema.awal,
      objekAkhir: tema.akhir,
      warnaJalur,
      labelKarakter: `Bantu ${tema.namaKarakter} ke ${tema.namaTujuan}`,
      dindingLabirin: layout.dinding,
    };

    return {
      idLatihan: 'labirin-sederhana',
      varian: 'default',
      instruksiTeks: `Bantu ${tema.namaKarakter} menemukan jalan ke ${tema.namaTujuan}!`,
      audioId: 'labirin-sederhana.default',
      jumlahPilihan: 0,
      contoh: [],
      pilihan: [],
      objekUtama: tema.awal,
      jalurGaris,
    };
  },
};
