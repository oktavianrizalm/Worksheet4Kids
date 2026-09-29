import { GeneratorLatihan, Soal, Pilihan, TitikPotongan, DataBagianHilang, PilihanBagianHilang } from '../tipe';
import { PRNG } from '../../random/prng';
import { SEMUA_WARNA_PALET } from '../../random/warna';
import { ObjectId } from '../../graphics/types';
import { GRAPHIC_OBJECTS } from '../../graphics/objects';

export const UKURAN_PAPAN_BAGIAN_HILANG = 240;

export interface ObjekBagianHilangDef {
  readonly objek: ObjectId;
  readonly nama: string;
  readonly titikDaftar: readonly TitikPotongan[];
}

export const DAFTAR_OBJEK_BAGIAN_HILANG: readonly ObjekBagianHilangDef[] = [
  {
    objek: 'mobil',
    nama: 'Mobil',
    titikDaftar: [
      { x: 84, y: 156, r: 36, namaBagian: 'Roda Depan' },
      { x: 120, y: 92, r: 36, namaBagian: 'Jendela Mobil' },
      { x: 164, y: 156, r: 36, namaBagian: 'Roda Belakang' },
    ],
  },
  {
    objek: 'rumah',
    nama: 'Rumah',
    titikDaftar: [
      { x: 120, y: 168, r: 36, namaBagian: 'Pintu Rumah' },
      { x: 148, y: 136, r: 32, namaBagian: 'Jendela Rumah' },
      { x: 120, y: 80, r: 36, namaBagian: 'Atap Rumah' },
    ],
  },
  {
    objek: 'ikan',
    nama: 'Ikan',
    titikDaftar: [
      { x: 80, y: 120, r: 36, namaBagian: 'Kepala Ikan' },
      { x: 172, y: 120, r: 36, namaBagian: 'Ekor Ikan' },
    ],
  },
  {
    objek: 'kupu_kupu',
    nama: 'Kupu-kupu',
    titikDaftar: [
      { x: 80, y: 100, r: 36, namaBagian: 'Sayap Kiri' },
      { x: 160, y: 100, r: 36, namaBagian: 'Sayap Kanan' },
    ],
  },
  {
    objek: 'apel',
    nama: 'Apel',
    titikDaftar: [
      { x: 120, y: 64, r: 34, namaBagian: 'Tangkai & Daun' },
      { x: 120, y: 132, r: 38, namaBagian: 'Buah Apel' },
    ],
  },
  {
    objek: 'bunga',
    nama: 'Bunga',
    titikDaftar: [
      { x: 120, y: 112, r: 36, namaBagian: 'Kelopak Tengah' },
      { x: 120, y: 68, r: 34, namaBagian: 'Kelopak Atas' },
    ],
  },
  {
    objek: 'perahu',
    nama: 'Perahu',
    titikDaftar: [
      { x: 120, y: 96, r: 36, namaBagian: 'Layar Perahu' },
      { x: 120, y: 164, r: 36, namaBagian: 'Badan Perahu' },
    ],
  },
  {
    objek: 'kue',
    nama: 'Kue',
    titikDaftar: [
      { x: 120, y: 72, r: 34, namaBagian: 'Lilin & Api' },
      { x: 120, y: 148, r: 38, namaBagian: 'Kue Manis' },
    ],
  },
  {
    objek: 'jamur',
    nama: 'Jamur',
    titikDaftar: [
      { x: 120, y: 92, r: 36, namaBagian: 'Payung Jamur' },
      { x: 120, y: 156, r: 36, namaBagian: 'Batang Jamur' },
    ],
  },
  {
    objek: 'balon',
    nama: 'Balon',
    titikDaftar: [
      { x: 120, y: 92, r: 38, namaBagian: 'Balon Udara' },
      { x: 120, y: 160, r: 34, namaBagian: 'Simpul Tali' },
    ],
  },
  {
    objek: 'es_krim',
    nama: 'Es Krim',
    titikDaftar: [
      { x: 120, y: 90, r: 36, namaBagian: 'Krim Manis' },
      { x: 120, y: 164, r: 36, namaBagian: 'Kerucut Cone' },
    ],
  },
  {
    objek: 'matahari',
    nama: 'Matahari',
    titikDaftar: [
      { x: 120, y: 120, r: 38, namaBagian: 'Wajah Matahari' },
      { x: 168, y: 72, r: 34, namaBagian: 'Sinar Matahari' },
    ],
  },
  {
    objek: 'payung',
    nama: 'Payung',
    titikDaftar: [
      { x: 120, y: 92, r: 38, namaBagian: 'Kubah Payung' },
      { x: 120, y: 170, r: 34, namaBagian: 'Gagang Payung' },
    ],
  },
  {
    objek: 'pohon',
    nama: 'Pohon',
    titikDaftar: [
      { x: 120, y: 96, r: 38, namaBagian: 'Daun Pohon' },
      { x: 120, y: 164, r: 34, namaBagian: 'Batang Pohon' },
    ],
  },
  {
    objek: 'kunci',
    nama: 'Kunci',
    titikDaftar: [
      { x: 90, y: 120, r: 36, namaBagian: 'Kepala Kunci' },
      { x: 168, y: 120, r: 34, namaBagian: 'Gerigi Kunci' },
    ],
  },
  {
    objek: 'topi',
    nama: 'Topi',
    titikDaftar: [
      { x: 110, y: 100, r: 36, namaBagian: 'Badan Topi' },
      { x: 164, y: 140, r: 34, namaBagian: 'Lidah Topi' },
    ],
  },
  {
    objek: 'bintang',
    nama: 'Bintang',
    titikDaftar: [
      { x: 120, y: 70, r: 34, namaBagian: 'Ujung Atas Bintang' },
      { x: 120, y: 120, r: 38, namaBagian: 'Tengah Bintang' },
    ],
  },
  {
    objek: 'hati',
    nama: 'Hati',
    titikDaftar: [
      { x: 90, y: 90, r: 36, namaBagian: 'Lengkung Hati' },
      { x: 120, y: 168, r: 34, namaBagian: 'Ujung Bawah Hati' },
    ],
  },
];

/**
 * Generator Latihan #16: Bagian yang Hilang (Find the Missing Piece)
 * - Mengasah persepsi penutupan visual (visual closure) dan ketelitian detail anak 3-5 tahun.
 * - Memilih objek tematik dengan bagian berlubang (circular cutout).
 * - Menghasilkan 4 pilihan potongan bulat: 1 jawaban benar dan 3 pengecoh cerdik (warna lain, objek lain).
 */
export const generatorBagianYangHilang: GeneratorLatihan = {
  id: 'bagian-yang-hilang',
  judul: 'Bagian yang Hilang',
  buatSoal(rng: PRNG): Soal {
    // 1. Pilih objek utama dari daftar definisi
    const defObjek = rng.pick(DAFTAR_OBJEK_BAGIAN_HILANG);
    const objek = defObjek.objek;
    const titikHilang = rng.pick(defObjek.titikDaftar);
    const warna = rng.pick(SEMUA_WARNA_PALET);
    const namaObjek = GRAPHIC_OBJECTS[objek]?.name ?? defObjek.nama;

    // 2. Siapkan 4 pilihan potongan
    // Pilihan 1: Jawaban Benar (Objek sama, warna sama, titik sama)
    const pilihanBenar: PilihanBagianHilang = {
      id: 'opt-benar',
      objek,
      warna,
      titik: titikHilang,
      benar: true,
    };

    // Pilihan 2: Pengecoh Warna (Objek sama, titik sama, tetapi warna berbeda)
    const warnaLain = rng.pick(SEMUA_WARNA_PALET.filter((w) => w !== warna));
    const distractorWarna: PilihanBagianHilang = {
      id: 'opt-beda-warna',
      objek,
      warna: warnaLain,
      titik: titikHilang,
      benar: false,
    };

    // Pilihan 3: Pengecoh Objek Lain A
    const objekLainDaftarA = DAFTAR_OBJEK_BAGIAN_HILANG.filter((d) => d.objek !== objek);
    const defLainA = rng.pick(objekLainDaftarA);
    const distractorObjekA: PilihanBagianHilang = {
      id: 'opt-objek-a',
      objek: defLainA.objek,
      warna: rng.pick(SEMUA_WARNA_PALET),
      titik: rng.pick(defLainA.titikDaftar),
      benar: false,
    };

    // Pilihan 4: Pengecoh Objek Lain B
    const objekLainDaftarB = DAFTAR_OBJEK_BAGIAN_HILANG.filter(
      (d) => d.objek !== objek && d.objek !== defLainA.objek
    );
    const defLainB = rng.pick(objekLainDaftarB);
    const distractorObjekB: PilihanBagianHilang = {
      id: 'opt-objek-b',
      objek: defLainB.objek,
      warna: rng.pick(SEMUA_WARNA_PALET),
      titik: rng.pick(defLainB.titikDaftar),
      benar: false,
    };

    // Acak urutan 4 pilihan
    const pilihanAcak = rng.shuffle([
      pilihanBenar,
      distractorWarna,
      distractorObjekA,
      distractorObjekB,
    ]);

    // Format array pilihan standar untuk mematuhi kontrak Soal
    const pilihanStandar: Pilihan[] = pilihanAcak.map((p, idx) => ({
      id: `pilihan-${idx}-${p.id}`,
      objek: p.objek,
      warna: p.warna,
      mode: 'warna',
      skala: 1,
      benar: p.benar,
    }));

    const dataBagianHilang: DataBagianHilang = {
      objek,
      warna,
      titikHilang,
      pilihanPotongan: pilihanAcak,
    };

    return {
      idLatihan: 'bagian-yang-hilang',
      varian: 'default',
      instruksiTeks: `Cari potongan ${titikHilang.namaBagian} yang hilang agar ${namaObjek} menjadi lengkap!`,
      audioId: 'bagian-yang-hilang.default',
      jumlahPilihan: 4,
      contoh: [],
      pilihan: pilihanStandar,
      objekUtama: objek,
      dataBagianHilang,
    };
  },
};
