# RENCANA ARSITEKTUR & IMPLEMENTASI
**Webapp Persepsi Visual Anak Usia 3 Tahun (Versi Layar dari Lembar Kerja Cetak)**

---

## 1. Keputusan Arsitektur dan Alasannya

### 1.1. Core Engine: Vanilla TypeScript + Vite (Tanpa Framework UI)
* **Keputusan:** Menggunakan Vite murni dengan TypeScript tanpa React, Vue, atau Svelte.
* **Alasan:**
  1. *Footprint minimal:* Ukuran bundel total JavaScript < 35 KB (gzipped), memastikan waktu muat seketika (*instant-load*) bahkan di tablet low-end.
  2. *Siklus Hidup Terkendali Penuh:* Aplikasi hanya berpindah antar dua layar besar: Layar Beranda (Menu 12 Latihan) dan Layar Sesi Latihan (Viewport tunggal 100dvh). State transisi sangat sederhana.
  3. *Zero Framework Overhead:* Interaksi visual didominasi oleh manipulasi atribut SVG secara dinamis dan kelas CSS animasi sederhana. Framework berbasis Virtual DOM hanya menambahkan lapisan abstraksi yang tidak diperlukan.

### 1.2. Pustaka Objek Grafis: SVG Berbasis Data Murni (*Functional Vector Definition*)
* **Keputusan:** Ke-28 objek grafis didefinisikan sebagai fungsi komputasi data TypeScript yang menghasilkan elemen SVG atau string `<path>`, bukan berkas `.svg` terpisah di folder `public/assets`.
* **Alasan:**
  1. *Dukungan 3 Mode Render Seketika:* Setiap objek harus dapat dirender dalam mode:
     - **Full Color:** Menggunakan palet tetap 8 warna (#E8332F, dll.) dengan kontur gelap (#22232E, tebal 3px).
     - **Siluet (Bayangan):** Mengabaikan warna internal, seluruh jalur diisi warna abu-abu netral gelap (#22232E) dengan bentuk luar yang identik.
     - **Garis Luar (Outline):** Warna isian putih/transparan untuk latihan mewarnai.
  2. *Manajemen State Warna:* Pada latihan #12 (Warnai Seperti Contoh), kita dapat mengubah atribut `fill` pada *path* secara langsung tanpa manipulasi DOM SVG yang rapuh.
  3. *Ukuran Bundle Sangat Ringkas:* 28 objek yang didefinisikan dalam path string terkompresi hanya memakan ~8-12 KB.

### 1.3. Arsitektur Audio: Suara Narasi Pre-baked + Web Audio Synthesizer
* **Keputusan:**
  - **Efek Suara Interaksi (Nada Benar / Goyangan):** Menggunakan **Web Audio API** sintetis murni (OscillatorNode jenis sine/triangle dengan Envelope sederhana). Tidak memerlukan file audio eksternal untuk SFX.
  - **Suara Narasi Instruksi:** Menggunakan **berkas audio ringkas (Opus/MP3)** yang diproduksi terlebih dahulu untuk ~15 kalimat instruksi orang tua, dengan *fallback* tenang jika audio dinonaktifkan.
* **Alasan:**
  1. *Kegagalan Web Speech API pada Tablet Offline:* Web Speech API (`speechSynthesis`) sangat tidak konsisten pada Android dan iPad saat offline. Suara Bahasa Indonesia (`id-ID`) sering kali tidak terpasang secara lokal di sistem operasi tablet. Jika dipaksakan, browser akan membaca teks Indonesia dengan aksen Inggris yang aneh atau gagal tanpa pesan kesalahan.
  2. *Ukuran Audio Sangat Kecil:* 15 kalimat instruksi berdurasi 2-3 detik yang dikompresi (Opus 32kbps) total ukurannya kurang dari 250 KB. Seluruhnya di-*cache* oleh Service Worker untuk 100% offline.
  3. *Kualitas Hangat untuk Balita:* Suara sintetis bawaan OS terdengar kaku dan dingin, sedangkan suara terarah yang direkam/dibuat dengan intonasi hangat jauh lebih ramah untuk anak 3 tahun.

### 1.4. Manajemen Sentuhan Tablet (Palm Rejection & Toddler Ergonomics)
* **Keputusan:**
  1. Menerapkan CSS `touch-action: none;` pada viewport permainan, serta `user-select: none;` dan `overscroll-behavior: none;`.
  2. Menggunakan **Pointer Events API** (`pointerdown`, `pointerup`) dengan validasi `e.isPrimary === true`. Sentuhan sekunder (seperti telapak tangan yang menempel di layar) otomatis diabaikan.
  3. *Debounce Interaksi & Kunci Animasi:* Begitu sebuah objek ditekan, seluruh input dikunci selama 300–500 ms (durasi animasi goyang/nada sukses) untuk mencegah balita menekan bertubi-tubi secara tidak sengaja.
  4. Tata Letak Viewport Tunggal: Memakai unit CSS `100dvh` dengan tata letak flexbox/grid yang dihitung agar seluruh elemen muat dalam 1 layar tanpa memicu scroll bar. Catatan teknis: pinch-zoom dan gesture sistem tidak dapat dicegah secara andal di iOS Safari murni berbasis meta viewport atau CSS; Guided Access (iOS) / App Pinning (Android) adalah satu-satunya pengunci sistemik nyata.

### 1.5. Navigasi & Parental Gate (Area Orang Tua)
* **Keputusan:**
  - Tombol Area Orang Tua diletakkan di sudut kanan atas dengan gestur **Tekan-Tahan selama 2.5 detik** (*Long-press indicator*) untuk membuka Layar Area Orang Tua (panduan OS, sakelar audio, info versi), tanpa aksi penutupan jendela browser (karena tidak bekerja di PWA standalone).
* **Alasan:**
  - Menghindari frustrasi anak jika telapak atau jari mereka tidak sengaja menyenggol tombol di tengah sesi latihan.

---

## 2. Struktur Direktori dan Daftar Berkas

```
codingforbabies/
├── index.html                  # Entry point HTML tunggal (viewport meta, PWA tags)
├── package.json                # Dependensi Vite, TypeScript
├── tsconfig.json               # Konfigurasi TypeScript
├── vite.config.ts              # Konfigurasi bundler Vite & PWA plugin
├── public/
│   ├── favicon.ico
│   ├── manifest.webmanifest   # Konfigurasi PWA (standalone, orientation: landscape/portrait lock)
│   ├── icons/                 # Ikon aplikasi PWA (192x192, 512x512)
│   └── audio/                 # Audio narasi instruksi (15 berkas .mp3 ringkas)
│       ├── instruksi_01.mp3   # "Cocokkan warna yang sama"
│       ├── ...
│       └── instruksi_12.mp3
└── src/
    ├── main.ts                 # Inisialisasi aplikasi, routing layar sederhana, PWA register
    ├── types/
    │   ├── graphics.ts         # Tipe data objek grafis, palet, dan mode render
    │   ├── exercise.ts         # Tipe data latihan, soal, dan state interaksi
    │   └── audio.ts            # Tipe data interface audio
    ├── data/
    │   ├── palette.ts          # Konstanta 8 warna dan warna batas/chrome
    │   ├── clusters.ts         # Tabel kelompok kemiripan objek & aturan penolakan
    │   └── objects/            # Definisi 28 objek gambar (vektor data 100x100)
    │       ├── index.ts        # Pustaka objek gabungan & validator kemiripan
    │       ├── shapes.ts       # 6 bentuk dasar
    │       └── things.ts       # 22 benda nyata
    ├── services/
    │   ├── audio.ts            # Web Audio synth (chime, wobble) & Audio narrative player
    │   └── storage.ts          # Wrapper localStorage defensif (fallback memory)
    ├── ui/
    │   ├── styles/
    │   │   ├── reset.css       # Reset CSS, box-sizing, touch-action, font chunky
    │   │   ├── variables.css   # Variabel CSS (warna palet, shadow tebal, border)
    │   │   └── animations.css  # Animasi sukses (pop-scale), goyang lembut (wobble)
    │   ├── components/
    │   │   ├── app-header.ts   # Chrome atas: tombol kembali aman, instruksi orang tua
    │   │   ├── card.ts         # Komponen kartu bergaya cetak (thick border, solid shadow)
    │   │   └── svg-renderer.ts # Generator DOM SVG dari objek data
    │   └── screens/
    │       ├── home-screen.ts  # Menu pilihan 12 latihan & catatan untuk orang tua
    │       └── exercise-screen.ts # Viewport latihan (orchestrator soal & transisi)
    └── engines/                # Logika pembangun soal untuk 12 jenis latihan
        ├── base-engine.ts      # Base class/interface untuk engine latihan
        ├── 01-match-color.ts   # Cocokkan Warna
        ├── 02-match-shape.ts   # Cocokkan Bentuk
        ├── 03-find-same.ts     # Cari yang Sama
        ├── 04-find-different.ts# Cari yang Berbeda
        ├── 05-big-small.ts     # Besar dan Kecil
        ├── 06-match-shadow.ts  # Cocokkan Bayangan
        ├── 07-continue-pattern.ts # Lanjutkan Pola
        ├── 08-find-pair.ts     # Cari Pasangannya
        ├── 09-count-objects.ts # Hitung Gambarnya
        ├── 10-circle-same.ts   # Lingkari Semua yang Sama
        ├── 11-follow-line.ts   # Ikuti Garis (finger gesture)
        └── 12-color-like-sample.ts # Warnai Seperti Contoh (finger gesture)
```

---

## 3. Antarmuka dan Tipe Data Inti

### 3.1. Objek Gambar (`src/types/graphics.ts`)
```typescript
export type PaletteColor =
  | 'merah'   // #E8332F
  | 'oranye'  // #F78C21
  | 'kuning'  // #FDCB1E
  | 'hijau'   // #4CB84C
  | 'biru'    // #2B80D9
  | 'ungu'    // #9452BF
  | 'pink'    // #F26BA0
  | 'tosca';  // #29BAB5

export type ObjectId =
  // 6 Bentuk
  | 'lingkaran' | 'kotak' | 'segitiga' | 'bintang' | 'hati' | 'ketupat'
  // 22 Benda
  | 'apel' | 'balon' | 'ikan' | 'kupu_kupu' | 'matahari' | 'awan'
  | 'pohon' | 'rumah' | 'mobil' | 'gelas' | 'es_krim' | 'payung'
  | 'bola' | 'daun' | 'perahu' | 'jamur' | 'topi' | 'kue'
  | 'telur' | 'bunga' | 'bulan' | 'kunci';

export type RenderMode = 'color' | 'silhouette' | 'outline';

export interface SvgPathPart {
  d: string;
  fillKey?: 'primary' | 'secondary' | 'accent' | 'fixed'; // Atribut pengelompokan warna
  fixedColor?: string; // Jika ada bagian yang selalu putih/hitam (misal titik mata)
  stroke?: boolean;    // Apakah memiliki garis tepi #22232E
}

export interface GraphicObjectDefinition {
  id: ObjectId;
  nameIndonesian: string;
  viewBox: '0 0 100 100';
  isSilhouetteDistinct: boolean; // Valid untuk latihan bayangan
  isCleanOutline: boolean;        // Valid untuk latihan mewarnai
  render(color: string, mode: RenderMode): string; // Menghasilkan markup path SVG
}
```

### 3.2. Representasi Soal dan Latihan (`src/types/exercise.ts`)
```typescript
import { ObjectId, PaletteColor, RenderMode } from './graphics';

export type ExerciseTypeId =
  | 'cocokkan_warna'
  | 'cocokkan_bentuk'
  | 'cari_yang_sama'
  | 'cari_yang_berbeda'
  | 'besar_dan_kecil'
  | 'cocokkan_bayangan'
  | 'lanjutkan_pola'
  | 'cari_pasangannya'
  | 'hitung_gambarnya'
  | 'lingkari_semua_yang_sama'
  | 'ikuti_garis'
  | 'warnai_seperti_contoh';

export interface ExerciseDefinition {
  id: ExerciseTypeId;
  title: string;
  parentInstruction: string; // Instruksi teks untuk orang tua
  audioInstructionId: string; // ID audio untuk diputar
  interactionType: 'tap_select' | 'finger_gesture';
  questionsPerSession: number; // 3 - 4 soal
}

// Item grafis dalam satu opsi soal
export interface QuestionVisualItem {
  uid: string;                 // ID unik per elemen di DOM
  objectId: ObjectId;
  color: PaletteColor;
  mode: RenderMode;
  scale?: number;              // Untuk latihan Besar dan Kecil (misal 1.0 vs 0.55)
  isCorrectTarget: boolean;    // Penanda apakah elemen ini jawaban benar
}

// Struktur data satu soal (generik untuk tap-select)
export interface QuestionData {
  id: string;
  promptTextForParent: string;
  sampleItem?: QuestionVisualItem;    // Contoh target (jika ada, misal di "Cari yang Sama")
  choices: QuestionVisualItem[];      // Opsi yang dapat ditekan anak (min 64x64px)
  metadata?: Record<string, unknown>; // Data khusus (misal koordinat kurva untuk #11)
}

// Antarmuka Engine Latihan
export interface ExerciseEngine {
  generateQuestion(questionIndex: number): QuestionData;
  validateChoice(selectedUid: string, question: QuestionData): boolean;
}
```

---

## 4. Urutan Pengerjaan dalam 5 Tahap

Setiap tahap memiliki target keluaran yang konkret, fungsional, dan dapat diuji langsung di peramban.

### Tahap 1: Fondasi Kerangka Proyek, Sistem Grafis SVG, & Validasi Kemiripan
* **Fokus:** Menyiapkan Vite + TypeScript, pustaka grafis 28 objek, aturan kemiripan (*similarity filter*), dan palet warna.
* **Yang Harus Bisa Dijalankan & Diuji:**
  1. Halaman galeri pengujian (*test bench*) yang merender ke-28 objek SVG dalam 3 mode (Warna, Siluet, Outline).
  2. Uji konsistensi: Semua objek berada dalam kotak 100x100 dengan garis batas #22232E setebal 3px dan sudut membulat.
  3. Uji fungsi `pickDistinctObjects()`: Memastikan sistem acak tidak pernah mengeluarkan 2 objek dari kelompok kemiripan yang sama (misal {awan, topi} atau {apel, balon}) dalam satu kumpulan opsi.

### Tahap 2: UI Chrome Bergaya Cetak, Mesin Audio Sintetis, & Ergonomi Sentuh
* **Fokus:** Tata letak *single-viewport* (100dvh), kartu fisik neobrutalism-lite (bayangan geser tanpa blur, garis tebal), modul Web Audio untuk SFX, dan modul pengaman sentuhan (*palm rejection*).
* **Yang Harus Bisa Dijalankan & Diuji:**
  1. Halaman demo interaktif berisi kartu target.
  2. Tekan kartu target:
     - Jika jawaban benar: Animasi membesar sesaat (*pop-scale*) + nada bel gembira berdurasi 300 ms.
     - Jika bukan target: Kartu bergoyang halus (*gentle wobble*) tanpa suara salah dan tanpa warna merah.
  3. Penekanan menggunakan 2 jari sekaligus atau telapak tangan hanya mengaktifkan satu elemen primer (`e.isPrimary`).
  4. Tombol "Keluar" di pojok atas memerlukan *long-press* 1.5 detik untuk aktif.

### Tahap 3: Implementasi 5 Latihan Tekan-Pilih Pertama (#1 - #5)
* **Fokus:**
  - #1 Cocokkan Warna
  - #2 Cocokkan Bentuk
  - #3 Cari yang Sama
  - #4 Cari yang Berbeda
  - #5 Besar dan Kecil
* **Yang Harus Bisa Dijalankan & Diuji:**
  1. Layar Beranda yang menampilkan kartu pilihan latihan.
  2. Setiap latihan menyajikan 3-4 soal acak secara berurutan.
  3. Sesi selesai tanpa skor atau persentase, langsung kembali ke beranda dengan animasi transisi yang menenangkan.
  4. Seluruh tata letak muat rapi dalam satu layar tablet tanpa *scroll*.

### Tahap 4: Implementasi 5 Latihan Tekan-Pilih Kedua (#6 - #10)
* **Fokus:**
  - #6 Cocokkan Bayangan (hanya objek bersiluet tegas)
  - #7 Lanjutkan Pola (Pola AB AB)
  - #8 Cari Pasangannya
  - #9 Hitung Gambarnya (1-3 objek dengan tombol angka chunky)
  - #10 Lingkari Semua yang Sama (8 item di layar, menemukan 3 target)
* **Yang Harus Bisa Dijalankan & Diuji:**
  1. Soal nomor 6 hanya menggunakan objek terverifikasi `isSilhouetteDistinct: true`.
  2. Soal nomor 9 menampilkan objek 1–3 buah dengan tombol angka 1, 2, 3 berukuran minimal 80x80px.
  3. Soal nomor 10 mengizinkan penekanan 3 objek target satu per satu dengan penanda lingkaran visual tebal hingga ketiga-tiganya ditemukan, baru melaju ke soal berikutnya.

### Tahap 5: Implementasi 2 Latihan Gerak Jari (#11, #12), PWA Offline, & Pengujian Menyeluruh
* **Fokus:**
  - #11 Ikuti Garis (tracing jalur bergelombang halus dengan toleransi sentuhan lebar 50px)
  - #12 Warnai Seperti Contoh (palet warna chunky + isi area gambar)
  - Integrasi Service Worker PWA (manifest, offline caching berkas audio dan aset)
  - Catatan orang tua di beranda (peran layar sebagai pelengkap, bukan pengganti motorik pensil).
* **Yang Harus Bisa Dijalankan & Diuji:**
  1. Latihan 11 dapat ditelusuri balita dengan toleransi jari yang longgar; jika jari terangkat di tengah jalan, progres tidak direset secara kejam melainkan melanjutkan dari titik terdekat.
  2. Latihan 12 memungkinkan anak memilih warna dari palet 8 tombol besar lalu menyentuh gambar outline untuk mengisinya sesuai contoh.
  3. Webapp dipasang ke layar beranda tablet (*Add to Home Screen*) dan dapat dibuka dalam Airplane Mode (tanpa koneksi internet sama sekali).

---

## 5. Matriks Risiko & Protokol Pengujian di Tablet Sungguhan

| Potensi Masalah di Tablet | Dampak pada Balita 3 Tahun | Solusi Teknis dalam Arsitektur | Cara Menguji di Tablet Sungguhan |
| :--- | :--- | :--- | :--- |
| **Bilah Alamat Peramban Muncul / Turun (*Resize Jitter*)** | Layar terpotong, elemen bergeser saat anak menyentuh bagian tepi atas/bawah. | Menggunakan CSS `height: 100dvh; max-height: 100dvh; overflow: hidden; position: fixed; width: 100vw;`. | Buka di Safari iPad / Chrome Android, lakukan usapan (*swipe*) dari atas ke bawah. Pastikan layout tidak bergerak sama sekali. |
| **Telapak Tangan / Jari Dobel (*Palm Contact*)** | Memilih jawaban yang salah secara tidak sengaja saat tangan bersandar. | Event listener `pointerdown` dengan filter `if (!e.isPrimary) return;` dan debouncing state `isEvaluating`. | Tempelkan telapak tangan kiri ke layar sambil jari kanan menekan target. Pastikan hanya target jari kanan yang bereaksi. |
| **Zoom atau Seleksi Teks yang Tidak Sengaja** | Muncul kotak biru seleksi teks atau layar membesar saat anak mengetuk cepat. | CSS: `user-select: none; -webkit-user-select: none; touch-action: none;` serta meta viewport `maximum-scale=1.0`. Namun pinch-zoom di iOS Safari tidak dapat dicegah secara andal via web; Guided Access (iOS) / App Pinning (Android) adalah satu-satunya pengunci sistemik nyata. | Lakukan ketukan ganda (*double-tap*) cepat dan gerakan cubit (*pinch*) di berbagai area layar. Pastikan seleksi teks mati dan edukasikan Guided Access ke orang tua. |
| **Koneksi Internet Mati (Offline)** | Aplikasi macet atau suara narasi hilang jika mengandalkan CDN / TTS cloud. | Seluruh aset JS/CSS/SVG dan audio narasi di-bundle lokal dan di-*pre-cache* lewat Service Worker PWA. | Aktifkan *Airplane Mode* pada tablet, matikan Wi-Fi, muat ulang aplikasi (*hard refresh*). Pastikan seluruh 12 latihan dan suara tetap berfungsi normal. |
| **Audio Terblokir oleh Kebijakan *Autoplay*** | Tidak ada suara sama sekali karena browser memblokir audio sebelum interaksi pertama. | Inisialisasi/resume `AudioContext` pada sentuhan pertama di layar beranda (misal saat memilih latihan). | Nyalakan tablet dari keadaan mute/unmute, buka webapp, tekan menu latihan pertama. Pastikan nada lembut terdengar tanpa kendala. |
| **Frustrasi Gerak Jari (#11 Ikuti Garis)** | Jari balita berguncang (*wobbly*), jika deteksi garis terlalu kaku, anak akan selalu gagal. | Implementasi *waypoint collision* berjarak dengan radius toleransi 48–60px (seukuran ujung jari balita). | Minta anak atau gunakan ibu jari yang digerakkan secara melenceng dari garis. Pastikan indikator tetap merespons asalkan berada di koridor jalur. |

---

## 6. Verifikasi Penerimaan (Acceptance Criteria) Sebelum Masuk Tahap Koding

Aplikasi dianggap siap dibangun jika:
1. Skema tipe data objek dan generator telah disetujui tanpa ambiguitas.
2. Keputusan penggunaan audio file ringkas vs Web Speech API telah diputuskan.
3. Desain interaksi pencegahan tombol keluar tidak sengaja telah disetujui.
