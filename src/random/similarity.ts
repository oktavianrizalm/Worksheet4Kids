import { ObjectId } from '../graphics/types';
import { PRNG } from './prng';

/**
 * Tabel kelompok objek bermiripan.
 * Objek dalam kelompok yang sama TIDAK BOLEH muncul bersamaan dalam satu soal.
 */
export const SIMILARITY_CLUSTERS: readonly (readonly ObjectId[])[] = [
  ['awan', 'topi', 'jamur', 'payung'],
  ['lingkaran', 'bola', 'telur', 'balon'],
  ['gelas', 'kue', 'es_krim'],
  ['segitiga', 'pohon', 'perahu'],
  ['bintang', 'bunga', 'matahari'],
  ['hati', 'daun', 'telur', 'bulan'],
  ['kotak', 'ketupat', 'rumah'],
] as const;

/**
 * Memeriksa apakah dua objek berada di kelompok kemiripan yang sama
 */
export function areSimilar(a: ObjectId, b: ObjectId): boolean {
  if (a === b) return true;
  for (const cluster of SIMILARITY_CLUSTERS) {
    if (cluster.includes(a) && cluster.includes(b)) {
      return true;
    }
  }
  return false;
}

/**
 * Memeriksa apakah suatu kandidat objek berkonflik dengan daftar objek yang sudah dipilih
 */
export function hasConflictWithExisting(candidate: ObjectId, existing: readonly ObjectId[]): boolean {
  for (const item of existing) {
    if (areSimilar(candidate, item)) {
      return true;
    }
  }
  return false;
}

/**
 * POOL_SILUET: Objek yang memiliki kontur siluet tegas dan tidak ambigu saat dihitamkan.
 * Objek seperti 'bola' (jahitannya hilang jadi lingkaran), 'lingkaran', dan 'telur'
 * dikeluarkan karena siluetnya identik satu sama lain dan membingungkan anak 3 tahun.
 */
export const POOL_SILUET: readonly ObjectId[] = [
  'bintang',
  'hati',
  'segitiga',
  'ketupat',
  'ikan',
  'kupu_kupu',
  'mobil',
  'perahu',
  'payung',
  'kunci',
  'bulan',
  'pohon',
  'jamur',
  'es_krim',
  'rumah',
  'gelas',
] as const;

/**
 * POOL_GARIS: Objek yang bersih saat digambar hanya sebagai garis tepi luar (outline).
 * MENGECUALIKAN objek yang tersusun dari bangun bertumpuk dengan garis dalam
 * yang memotong bentuk (seperti apel, awan, bunga, kue, mobil).
 */
export const POOL_GARIS: readonly ObjectId[] = [
  'lingkaran',
  'kotak',
  'segitiga',
  'bintang',
  'hati',
  'ketupat',
  'telur',
  'bulan',
  'daun',
  'balon',
] as const;

/**
 * POOL_WARNA_MURNI: Objek yang dalam mode 'warna' HANYA memakai satu warna palet
 * tanpa aksen warna alami kedua (misal: tanpa tangkai cokelat, atap merah, atau roda abu-abu).
 * Digunakan untuk latihan Cocokkan Warna agar variabel warna terisolasi secara sempurna.
 */
export const POOL_WARNA_MURNI: readonly ObjectId[] = [
  'lingkaran',
  'kotak',
  'segitiga',
  'bintang',
  'hati',
  'ketupat',
  'balon',
  'bola',
  'daun',
  'telur',
  'bulan',
  'awan',
] as const;

/**
 * Memilih N objek acak dari suatu kumpulan (pool) dengan JAMINAN:
 * - Tidak ada dua objek yang berasal dari kelompok kemiripan yang sama.
 * - Deterministik (parameter prng WAJIB disuntikkan).
 */
export function pilihBerbeda(
  kumpulan: readonly ObjectId[],
  jumlah: number,
  prng: PRNG
): ObjectId[] {
  if (jumlah <= 0) return [];
  if (jumlah > kumpulan.length) {
    throw new Error(
      `Jumlah yang diminta (${jumlah}) melebihi ukuran kumpulan objek (${kumpulan.length}).`
    );
  }

  // Buat salinan unik dan acak urutannya
  const uniquePool = Array.from(new Set(kumpulan));
  const shuffled = prng.shuffle(uniquePool);

  const selected: ObjectId[] = [];

  // Algoritma greedy dengan backtracking sederhana untuk mencari set bebas konflik
  function backtrack(startIndex: number): boolean {
    if (selected.length === jumlah) {
      return true;
    }

    for (let i = startIndex; i < shuffled.length; i++) {
      const candidate = shuffled[i];
      if (!hasConflictWithExisting(candidate, selected)) {
        selected.push(candidate);
        if (backtrack(i + 1)) {
          return true;
        }
        selected.pop();
      }
    }
    return false;
  }

  const success = backtrack(0);

  if (!success) {
    throw new Error(
      `Gagal memilih ${jumlah} objek bebas konflik kemiripan dari kumpulan yang diberikan.`
    );
  }

  return selected;
}

/**
 * Fungsi pembantu untuk memverifikasi apakah suatu array objek mematuhi aturan kemiripan
 * Mengembalikan array pelanggaran jika ada (misal: ["awan dan topi berada di cluster yang sama"])
 */
export function verifikasiBebasKemiripan(objects: readonly ObjectId[]): string[] {
  const violations: string[] = [];
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i];
      const b = objects[j];
      if (a === b) {
        violations.push(`Duplikat objek identik: ${a}`);
      } else if (areSimilar(a, b)) {
        violations.push(
          `Pelanggaran kemiripan: '${a}' dan '${b}' berada dalam kelompok kemiripan yang sama`
        );
      }
    }
  }
  return violations;
}
