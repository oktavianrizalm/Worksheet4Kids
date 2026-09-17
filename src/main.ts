import './styles/reset.css';
import './styles/shell.css';
import './styles/latihan.css';
import { injectTokens } from './tokens';
import { PengelolaLayar } from './shell/layar';
import { LayarBeranda } from './beranda/beranda';
import { LayarAreaOrangTua } from './beranda/area-orang-tua';
import { pasangGuardTombolBack } from './shell/navigasi';
import { PRNG } from './random/prng';
import { SesiLatihan } from './latihan/sesi';
import { MesinPilihSatu } from './latihan/mesin-pilih-satu';
import { MesinIkutiGaris } from './latihan/mesin-ikuti-garis';
import { MesinWarnaiContoh } from './latihan/mesin-warnai-contoh';
import { ambilGeneratorLatihan } from './latihan/daftar';
import { Layar } from './shell/tipe';

// 1. Suntikkan CSS variables dari single source of truth tokens desain
injectTokens();

const appRoot = document.getElementById('app');
if (!appRoot) {
  throw new Error('Elemen #app tidak ditemukan dalam dokumen.');
}

const urlParams = new URLSearchParams(window.location.search);

// 5.0b: Galeri dev dipindahkan sepenuhnya ke belakang import.meta.env.DEV dengan dynamic import
// sehingga seluruh kode galeri dan style.css tereliminasi total pada build produksi
if (import.meta.env.DEV && (urlParams.has('galeri') || urlParams.has('dev'))) {
  Promise.all([import('./style.css'), import('./gallery/gallery')]).then(([_, { initGallery }]) => {
    initGallery(appRoot);
  });
} else {
  // Mode Aplikasi Utama
  const pengelolaLayar = new PengelolaLayar(appRoot);

  type TipeLayar = 'beranda' | 'area-orang-tua' | 'latihan';
  let layarSekarang: TipeLayar = 'beranda';
  let seedSesiTerakhir: number | undefined = undefined;

  const bukaLatihan = (idLatihan: string) => {
    const generator = ambilGeneratorLatihan(idLatihan);
    if (!generator) {
      console.warn(`[Beranda] Generator untuk latihan "${idLatihan}" belum tersedia.`);
      return;
    }
    layarSekarang = 'latihan';
    const querySeed = urlParams.get('seed');
    const seed = querySeed ? parseInt(querySeed, 10) : Date.now();
    seedSesiTerakhir = seed;
    const sesiRng = new PRNG(seed);
    const sesi = new SesiLatihan({
      generator,
      rng: sesiRng,
      onSesiSelesai: () => {
        bukaBeranda();
      },
    });
    let layarLatihan: Layar;
    if (idLatihan === 'ikuti-garis') {
      layarLatihan = new MesinIkutiGaris({
        sesi,
        onKembaliKeBeranda: () => {
          bukaBeranda();
        },
      });
    } else if (idLatihan === 'warnai-seperti-contoh') {
      layarLatihan = new MesinWarnaiContoh({
        sesi,
        onKembaliKeBeranda: () => {
          bukaBeranda();
        },
      });
    } else {
      layarLatihan = new MesinPilihSatu({
        sesi,
        onKembaliKeBeranda: () => {
          bukaBeranda();
        },
      });
    }
    pengelolaLayar.tampilkan(layarLatihan);
  };

  const bukaBeranda = () => {
    layarSekarang = 'beranda';
    const beranda = new LayarBeranda({
      onPilihLatihan: (idLatihan: string) => {
        bukaLatihan(idLatihan);
      },
      onBukaAreaOrangTua: () => {
        bukaAreaOrangTua();
      },
    });
    pengelolaLayar.tampilkan(beranda);
  };

  const bukaAreaOrangTua = () => {
    layarSekarang = 'area-orang-tua';
    const areaOrangTua = new LayarAreaOrangTua({
      onKembali: () => bukaBeranda(),
      seedTerakhir: seedSesiTerakhir,
    });
    pengelolaLayar.tampilkan(areaOrangTua);
  };

  // Pasang Guard Tombol Back (3.3 & 4.0a)
  pasangGuardTombolBack(() => {
    if (layarSekarang !== 'beranda') {
      bukaBeranda();
      return true;
    }
    return false;
  });

  // Tampilkan layar awal berdasarkan query param atau default beranda
  if (urlParams.get('layar') === 'orang-tua') {
    bukaAreaOrangTua();
  } else if (urlParams.get('latihan')) {
    bukaLatihan(urlParams.get('latihan')!);
  } else {
    bukaBeranda();
  }

  // Registrasi Service Worker PWA (100% Offline Support)
  if ('serviceWorker' in navigator && !import.meta.env.DEV) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[PWA] Service worker gagal terpasang:', err);
      });
    });
  }
}
