# Worksheet4Kids

Aplikasi webapp latihan persepsi visual untuk anak usia 3 tahun berbasis PWA (*Progressive Web App*) yang 100% *offline-first*, ramah sentuhan balita (*palm rejection* & *touch ergonomics*), bebas iklan, dan dirancang tanpa tekanan gamifikasi skor.

## 🌟 Fitur Utama

- **12 Modul Latihan Persepsi Visual Lengkap**:
  1. Cocokkan Warna
  2. Cocokkan Bentuk
  3. Cari yang Sama
  4. Cari Berbeda
  5. Besar & Kecil
  6. Cocokkan Bayangan
  7. Lanjutkan Pola
  8. Cari Pasangannya
  9. Hitung Gambarnya
  10. Lingkari Semua yang Sama
  11. Ikuti Garis (*Finger Tracing*)
  12. Warnai Sesuai Contoh (*Coloring Canvas*)

- **Desain Bubbly Neobrutalist**:
  - Antarmuka ramah anak dengan kartu empuk berbingkai tebal warna-warni (*Google Stitch aesthetic*).
  - Teks instruksi melayang berukuran besar dan jelas.
  - Vektor SVG tajam dan jernih di semua resolusi layar tablet.

- **Kenyamanan & Keamanan Balita**:
  - **Ergonomi Sentuhan**: Dilengkapi proteksi penolakan telapak tangan (*palm rejection*) dan penolak ketukan ganda (*debounce*).
  - **Eksplorasi Tanpa Tekanan**: Tanpa bintang ranking, tanpa skor, tanpa timer, dan tanpa suara salah yang memicu kecemasan.
  - **Gerbang Area Orang Tua**: Pengaman *long-press* 2.5 detik untuk mengakses panduan sistem tablet (*Guided Access* iOS & *App Pinning* Android).
  - **100% Offline (PWA)**: Berjalan penuh tanpa koneksi internet (*Airplane Mode*) berkat Service Worker dan *zero external CDN*.

## 🛠️ Menjalankan Proyek

`ash
# Instal dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Jalankan pengujian otomatis (Vitest)
npm test

# Bangun versi produksi
npm run build
`

## 📜 Lisensi
MIT License
