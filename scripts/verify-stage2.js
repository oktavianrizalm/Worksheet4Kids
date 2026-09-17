// Automated verification script for Stage 2
import { GRAPHIC_OBJECTS, ALL_OBJECT_IDS } from '../src/graphics/objects.ts';
import { renderObjectSvg } from '../src/graphics/renderer.ts';
import { PALETTE } from '../src/tokens.ts';
import {
  SIMILARITY_CLUSTERS,
  POOL_SILUET,
  POOL_GARIS,
  POOL_WARNA_MURNI,
  pilihBerbeda,
  verifikasiBebasKemiripan,
} from '../src/random/similarity.ts';
import { PRNG } from '../src/random/prng.ts';

console.log('=== VERIFIKASI TAHAP 2: FONDASI ===\n');

// 1. Verifikasi Jumlah dan Kelengkapan Objek
console.log('1. Memeriksa 28 Objek Grafis:');
if (ALL_OBJECT_IDS.length !== 28) {
  throw new Error(`Harus ada tepat 28 objek, ditemukan: ${ALL_OBJECT_IDS.length}`);
}
console.log(`   ✓ Ditemukan tepat ${ALL_OBJECT_IDS.length} objek terdefinisi.`);

// 2. Verifikasi Rendering 3 Mode
console.log('\n2. Memeriksa Render 3 Mode (warna, siluet, garis):');
for (const id of ALL_OBJECT_IDS) {
  const obj = GRAPHIC_OBJECTS[id];
  
  // Render warna
  const svgWarna = renderObjectSvg(obj, PALETTE.biru, 'warna');
  if (!svgWarna.includes('viewBox="0 0 100 100"')) {
    throw new Error(`Objek ${id} tidak memiliki viewBox yang benar.`);
  }

  // Render siluet - pastikan tidak ada warna selain #22232E
  const svgSiluet = renderObjectSvg(obj, PALETTE.merah, 'siluet');
  const nonSiluetMatches = svgSiluet.match(/fill="(?!#22232E)[^"]+"/g);
  if (nonSiluetMatches) {
    throw new Error(`Objek ${id} pada mode siluet memiliki warna bocor: ${nonSiluetMatches.join(', ')}`);
  }

  // Render garis - pastikan fill hanya #FFFFFF (atau none untuk stroke)
  const svgGaris = renderObjectSvg(obj, PALETTE.hijau, 'garis');
  const invalidGarisFills = svgGaris.match(/fill="(?!#FFFFFF|none)[^"]+"/g);
  if (invalidGarisFills) {
    throw new Error(`Objek ${id} pada mode garis memiliki fill tidak valid: ${invalidGarisFills.join(', ')}`);
  }
}
console.log('   ✓ Ke-28 objek sukses dirender di ketiga mode.');
console.log('   ✓ Mode siluet terbukti 100% monolitik #22232E tanpa bercak aksen.');
console.log('   ✓ Mode garis terbukti 100% putih bersih tanpa warna tertinggal.');

// 3. Verifikasi Pengecek Kelompok Mirip (200x Percobaan)
console.log('\n3. Menjalankan Uji Bebas Kemiripan (200x per pool):');
const testPrng = new PRNG(98765);

// Test 1: Seluruh Objek (Ambil 4)
let violationsAll = 0;
for (let i = 1; i <= 200; i++) {
  const sample = pilihBerbeda(ALL_OBJECT_IDS, 4, testPrng);
  const violations = verifikasiBebasKemiripan(sample);
  if (violations.length > 0) violationsAll += violations.length;
}
console.log(`   ✓ Seluruh 28 Objek (Ambil 4) - 200 iterasi: ${violationsAll} pelanggaran.`);

// Test 2: POOL_SILUET (Ambil 3)
let violationsSiluet = 0;
for (let i = 1; i <= 200; i++) {
  const sample = pilihBerbeda(POOL_SILUET, 3, testPrng);
  const violations = verifikasiBebasKemiripan(sample);
  if (violations.length > 0) violationsSiluet += violations.length;
}
console.log(`   ✓ POOL_SILUET (${POOL_SILUET.length} objek, Ambil 3) - 200 iterasi: ${violationsSiluet} pelanggaran.`);

// Test 3: POOL_GARIS (Ambil 3)
let violationsGaris = 0;
for (let i = 1; i <= 200; i++) {
  const sample = pilihBerbeda(POOL_GARIS, 3, testPrng);
  const violations = verifikasiBebasKemiripan(sample);
  if (violations.length > 0) violationsGaris += violations.length;
}
console.log(`   ✓ POOL_GARIS (${POOL_GARIS.length} objek, Ambil 3) - 200 iterasi: ${violationsGaris} pelanggaran.`);

// Test 4: POOL_WARNA_MURNI (Ambil 3)
let violationsWarnaMurni = 0;
for (let i = 1; i <= 200; i++) {
  const sample = pilihBerbeda(POOL_WARNA_MURNI, 3, testPrng);
  const violations = verifikasiBebasKemiripan(sample);
  if (violations.length > 0) violationsWarnaMurni += violations.length;
}
console.log(`   ✓ POOL_WARNA_MURNI (${POOL_WARNA_MURNI.length} objek, Ambil 3) - 200 iterasi: ${violationsWarnaMurni} pelanggaran.`);

if (violationsAll + violationsSiluet + violationsGaris + violationsWarnaMurni > 0) {
  throw new Error('Ditemukan pelanggaran kemiripan dalam pengujian!');
}

console.log('\n=== SEMUA VERIFIKASI TAHAP 2 BERHASIL (100% LULUS) ===');
