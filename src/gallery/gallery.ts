import { GRAPHIC_OBJECTS, ALL_OBJECT_IDS } from '../graphics/objects';
import { renderObjectSvg } from '../graphics/renderer';
import { PALETTE, PaletteColorKey } from '../tokens';
import {
  SIMILARITY_CLUSTERS,
  POOL_SILUET,
  POOL_GARIS,
  pilihBerbeda,
  verifikasiBebasKemiripan,
} from '../random/similarity';
import { PRNG } from '../random/prng';
import {
  registerTapTarget,
  addDiagnosticListener,
  PointerDiagnosticLog,
  MAX_CONTACT_SIZE,
  TAP_DEBOUNCE_MS,
} from '../input/touch';

export function initGallery(root: HTMLElement): void {
  root.innerHTML = `
    <header class="header-container">
      <h1 class="header-title">Galeri Uji & Fondasi Persepsi Visual (Tahap 2)</h1>
      <p class="header-subtitle">
        Memverifikasi 28 objek gambar (3 mode render), 8 warna palet jawaban, generator bebas-kelompok-mirip, dan modul input sentuh tablet.
      </p>
      <nav class="nav-tabs">
        <button class="btn-tab active" data-tab="tab-modes">1. 28 Objek x 3 Mode</button>
        <button class="btn-tab" data-tab="tab-colors">2. 28 Objek x 8 Warna</button>
        <button class="btn-tab" data-tab="tab-similarity">3. Uji Bebas Kemiripan (200x)</button>
        <button class="btn-tab" data-tab="tab-touch">4. Penguji Input Sentuh Tablet</button>
        <button class="btn-tab" data-tab="tab-pools">5. Evaluasi POOL Siluet & Garis</button>
        <button class="btn-tab" data-tab="tab-kontak">6. Uji Kontak Nyata (Tablet)</button>
      </nav>
    </header>

    <main>
      <!-- TAB 1: 28 Objek x 3 Mode -->
      <section id="tab-modes" class="tab-pane active">
        <div class="gallery-grid" id="modes-grid"></div>
      </section>

      <!-- TAB 2: 28 Objek x 8 Warna -->
      <section id="tab-colors" class="tab-pane">
        <div class="checker-card">
          <p style="font-weight: 700; margin-bottom: 8px;">Pilih Warna Palet Uji:</p>
          <div class="palette-row" id="palette-picker"></div>
          <p id="current-color-label" style="font-size: 14px; color: #6B7280; font-weight: 700;"></p>
        </div>
        <div class="gallery-grid" id="colors-grid"></div>
      </section>

      <!-- TAB 3: Uji Bebas Kemiripan -->
      <section id="tab-similarity" class="tab-pane">
        <div class="checker-card">
          <h2 style="font-size: var(--font-lg); font-weight: 800; margin-bottom: 8px;">Pengecek Kelompok Objek Bermiripan</h2>
          <p style="color: #6B7280; margin-bottom: 16px;">
            Menjalankan fungsi <code>pilihBerbeda(kumpulan, jumlah)</code> sebanyak 200 kali secara berulang dengan seed acak untuk membuktikan tidak pernah ada dua objek dari cluster yang sama dalam satu soal.
          </p>

          <div style="background: #F3F4F6; padding: 12px; border-radius: var(--radius-sm); border: 2px solid var(--app-border); margin-bottom: 16px;">
            <p style="font-weight: 800; margin-bottom: 6px;">Daftar 7 Kelompok Kemiripan yang Ditolak Bersamaan:</p>
            <ul style="padding-left: 20px; font-size: 14px; line-height: 1.6;">
              ${SIMILARITY_CLUSTERS.map(
                (c, i) => `<li><strong>Cluster ${i + 1}:</strong> { ${c.join(', ')} }</li>`
              ).join('')}
            </ul>
          </div>

          <div class="checker-actions">
            <button id="btn-run-sim-all" class="btn-primary-action">
              ▶ Uji 200x pada Seluruh Objek (Ambil 4)
            </button>
            <button id="btn-run-sim-siluet" class="btn-primary-action">
              ▶ Uji 200x pada POOL_SILUET (Ambil 3)
            </button>
            <button id="btn-run-sim-garis" class="btn-primary-action">
              ▶ Uji 200x pada POOL_GARIS (Ambil 3)
            </button>
          </div>

          <div id="sim-test-status" style="font-weight: 800; font-size: 18px; margin-bottom: 8px;"></div>
          <div id="sim-test-log" class="test-results-box">Klik salah satu tombol di atas untuk menjalankan uji 200 percobaan...</div>
        </div>
      </section>

      <!-- TAB 4: Penguji Input Sentuh Tablet -->
      <section id="tab-touch" class="tab-pane">
        <div class="checker-card">
          <h2 style="font-size: var(--font-lg); font-weight: 800; margin-bottom: 8px;">Penguji Modul Input Sentuh Tablet</h2>
          <p style="color: #6B7280; margin-bottom: 16px;">
            Menguji spesifikasi input: Palm Rejection (ukuran kontak &gt; ${MAX_CONTACT_SIZE}px ditolak), pencocokan elemen pointerdown &amp; up, dan jeda debounce ${TAP_DEBOUNCE_MS}ms.
          </p>

          <div class="touch-tester-area" id="touch-area">
            <p style="font-size: 14px; color: #6B7280; font-weight: 700;">
              Sentuh area kotak di bawah menggunakan jari normal vs telapak tangan (palm contact):
            </p>
            <button class="touch-target-button" id="test-tap-btn">
              KETUK SAYA
            </button>
            <div class="tap-indicator" id="tap-indicator">Siap menerima sentuhan.</div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <p style="font-weight: 800;">Log Diagnostik Event Pointer (Real-time):</p>
            <button id="btn-clear-logs" class="btn-tab" style="padding: 6px 12px; font-size: 12px;">Hapus Log</button>
          </div>

          <div class="log-table-wrapper">
            <table class="log-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Waktu</th>
                  <th>Event</th>
                  <th>ID</th>
                  <th>Tipe</th>
                  <th>Ukuran (W x H)</th>
                  <th>isPrimary</th>
                  <th>Keputusan</th>
                  <th>Keterangan / Alasan</th>
                </tr>
              </thead>
              <tbody id="log-table-body">
                <tr>
                  <td colspan="9" style="text-align: center; color: #9CA3AF; padding: 16px;">Belum ada event pointer terdeteksi. Silakan ketuk tombol di atas.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB 5: Evaluasi POOL Siluet & Garis -->
      <section id="tab-pools" class="tab-pane">
        <div class="checker-card">
          <h2 style="font-size: var(--font-lg); font-weight: 800; margin-bottom: 8px;">Laporan Evaluasi POOL_SILUET dan POOL_GARIS</h2>
          <p style="color: #6B7280; margin-bottom: 16px;">
            Hasil observasi visual komparatif dari 28 objek grafis untuk menentukan kelayakan objek pada mode Siluet (Cocokkan Bayangan) dan mode Garis (Mewarnai).
          </p>

          <h3 style="font-size: var(--font-base); font-weight: 800; margin-top: 16px; margin-bottom: 8px;">1. Objek yang DIKELUARKAN dari POOL_GARIS (Outline Latihan Mewarnai)</h3>
          <p style="font-size: 14px; margin-bottom: 8px; color: #4B5563;">
            Objek-objek berikut dikeluarkan dari latihan mewarnai karena tersusun dari bangun bertumpuk sehingga garis kontur internalnya memotong bentuk dan merusak keterbacaan bagi balita 3 tahun:
          </p>
          <div class="test-results-box" style="margin-bottom: 20px;">
• <strong>apel</strong>: Tangkai dan daun memotong bagian atas buah.
• <strong>awan</strong>: Bentuk gumpalan saling memotong jika digambar garis luar.
• <strong>bunga</strong>: 5 lingkaran kelopak saling bertumpuk dengan putik tengah dan tangkai daun, menciptakan jaring garis rumit.
• <strong>kue</strong>: Lapisan lelehan gula, lilin, dan api menumpuk di atas silinder kue.
• <strong>mobil</strong>: Roda, velg, dan jendela memotong bodi mobil menjadi banyak segmen kecil.
• <strong>rumah</strong>: Segitiga atap menumpuk di atas bodi kotak, pintu dan jendela berada di dalam.
• <strong>ikan</strong>: Sirip punggung dan mata memotong garis kontur luar ikan.
• <strong>es_krim</strong>: Kerucut cone wafel menumpuk di bawah scoop es krim.
• <strong>jamur</strong>: Batang menumpuk di bawah tudung jamur, bintik bulat berada di dalam tudung.
• <strong>topi</strong>: Pita topi dan pinggiran visor memotong kubah mahkota topi.
• <strong>perahu</strong>: Tiang layar memotong layar dan lambung perahu.
• <strong>pohon</strong>: Batang cokelat menumpuk di bawah tajuk daun bulat.
• <strong>kunci</strong>: Batang dan gerigi menumpuk di atas cincin kepala kunci.
• <strong>matahari</strong>: Sinar-sinar radial memotong ruang di sekitar piringan matahari.
          </div>

          <h3 style="font-size: var(--font-base); font-weight: 800; margin-top: 16px; margin-bottom: 8px;">2. Objek yang DIKELUARKAN dari POOL_SILUET (Cocokkan Bayangan)</h3>
          <p style="font-size: 14px; margin-bottom: 8px; color: #4B5563;">
            Objek-objek berikut dikeluarkan dari latihan bayangan karena bentuk siluet luarnya terlalu generik atau kehilangan ciri khas esensialnya saat dihitamkan:
          </p>
          <div class="test-results-box">
• <strong>bola</strong>: Garis jahitan bola hilang saat disiluetkan, sehingga bola menjadi lingkaran hitam polos yang 100% identik dengan 'lingkaran' dan 'telur'.
• <strong>lingkaran</strong>: Siluet lingkaran murni tanpa fitur unik mudah tertukar dengan bola dan telur.
• <strong>telur</strong>: Siluet oval telur sangat mirip dengan lingkaran dan bola dari sudut pandang balita.
• <strong>balon</strong>: Tanpa warna, siluet balon oval dengan tali tipis mudah tertukar dengan telur.
• <strong>matahari</strong>: Saat dihitamkan, sinar dan piringan menjadi bentuk roda bergerigi yang mirip dengan bunga.
• <strong>bunga</strong>: Saat dihitamkan menjadi gumpalan bergerigi yang ambigu dengan matahari.
• <strong>apel</strong>: Siluet buah apel menjadi bulatan bergelombang yang ambigu dengan tomat/bola.
• <strong>kue</strong>: Siluet kue tanpa warna tampak seperti balok bertingkat yang mirip gelas atau rumah terpotong.
• <strong>topi</strong>: Siluet topi kubah sangat mirip dengan tudung jamur (kelompok kemiripan topi & jamur).
• <strong>awan</strong>: Siluet awan menjadi gumpalan tak beraturan yang mirip daun atau buah.
• <strong>daun</strong>: Siluet daun tanpa urat tengah menjadi bentuk lengkung yang mirip bulan sabit.
          </div>
        </div>
      </section>

      <!-- TAB 6: Uji Ukuran Kontak Nyata (Tablet) -->
      <section id="tab-kontak" class="tab-pane">
        <div class="checker-card">
          <h2 style="font-size: var(--font-lg); font-weight: 800; margin-bottom: 8px;">Uji Ukuran Kontak Nyata (Tablet)</h2>
          <p style="color: #6B7280; margin-bottom: 16px;">
            Ketuk 4 kotak target 96×96 px di bawah ini menggunakan jari anak dan telapak tangan pada tablet sungguhan untuk merekam data mentah kontak pointer (width, height, pressure, pointerType).
          </p>

          <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px;">
            <div class="contact-box-target" data-box="1">
              <span style="font-size: 24px; font-weight: 800;">1</span>
              <span style="font-size: 11px; color: #6B7280;">96×96 px</span>
            </div>
            <div class="contact-box-target" data-box="2">
              <span style="font-size: 24px; font-weight: 800;">2</span>
              <span style="font-size: 11px; color: #6B7280;">96×96 px</span>
            </div>
            <div class="contact-box-target" data-box="3">
              <span style="font-size: 24px; font-weight: 800;">3</span>
              <span style="font-size: 11px; color: #6B7280;">96×96 px</span>
            </div>
            <div class="contact-box-target" data-box="4">
              <span style="font-size: 24px; font-weight: 800;">4</span>
              <span style="font-size: 11px; color: #6B7280;">96×96 px</span>
            </div>
          </div>

          <div id="contact-summary-banner" style="background: #F3F4F6; border: 2px solid var(--app-border); border-radius: var(--radius-sm); padding: 12px; margin-bottom: 16px;">
            <p style="font-weight: 800; margin-bottom: 4px;">Ringkasan Data Mentah Kontak:</p>
            <p id="contact-stats-text" style="font-size: 14px; font-family: monospace; color: #374151;">Belum ada sentuhan pada kotak di atas.</p>
            <div id="contact-warning-text" style="display: none; margin-top: 8px; padding: 8px; background: #FEF3C7; border: 1px solid #D97706; border-radius: 4px; font-size: 13px; color: #92400E;"></div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <p style="font-weight: 800;">30 Event Pointerdown Terakhir:</p>
            <div style="display: flex; gap: 8px;">
              <button id="btn-copy-contact-json" class="btn-tab" style="padding: 6px 12px; font-size: 12px;">📋 Salin JSON</button>
              <button id="btn-clear-contact" class="btn-tab" style="padding: 6px 12px; font-size: 12px;">Hapus Data</button>
            </div>
          </div>

          <div class="log-table-wrapper">
            <table class="log-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Waktu</th>
                  <th>Kotak</th>
                  <th>Tipe</th>
                  <th>Width</th>
                  <th>Height</th>
                  <th>Pressure</th>
                  <th>isPrimary</th>
                  <th>Koordinat (X, Y)</th>
                </tr>
              </thead>
              <tbody id="contact-table-body">
                <tr>
                  <td colspan="9" style="text-align: center; color: #9CA3AF; padding: 16px;">Silakan sentuh salah satu dari 4 kotak target di atas.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  `;

  // Inisialisasi Navigasi Tab
  const tabs = root.querySelectorAll<HTMLButtonElement>('.btn-tab[data-tab]');
  const panes = root.querySelectorAll<HTMLElement>('.tab-pane');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panes.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      if (targetId) {
        root.querySelector(`#${targetId}`)?.classList.add('active');
      }
    });
  });

  // 1. Render Tab 1: 28 Objek x 3 Mode
  renderModesTab(root);

  // 2. Render Tab 2: 28 Objek x 8 Warna
  renderColorsTab(root);

  // 3. Setup Tab 3: Uji Bebas Kemiripan
  setupSimilarityTab(root);

  // 4. Setup Tab 4: Penguji Input Sentuh
  setupTouchTab(root);

  // 5. Setup Tab 6: Penguji Ukuran Kontak Nyata
  setupContactSizeTab(root);
}

// -------------------------------------------------------------
// TAB 1: 28 Objek x 3 Mode Render
// -------------------------------------------------------------
function renderModesTab(root: HTMLElement): void {
  const container = root.querySelector('#modes-grid');
  if (!container) return;

  const testColor = PALETTE.biru; // Gunakan biru untuk representasi warna default

  container.innerHTML = ALL_OBJECT_IDS.map((id) => {
    const obj = GRAPHIC_OBJECTS[id];
    const isSiluet = POOL_SILUET.includes(id);
    const isGaris = POOL_GARIS.includes(id);

    return `
      <div class="object-card">
        <h3 class="object-card-title">${obj.name} (${obj.id})</h3>
        <div class="object-card-meta">
          <span class="badge badge-neutral">${obj.category.toUpperCase()}</span>
          ${isSiluet ? '<span class="badge badge-siluet">POOL SILUET</span>' : ''}
          ${isGaris ? '<span class="badge badge-garis">POOL GARIS</span>' : ''}
        </div>
        <div class="modes-row">
          <div class="mode-column">
            <div class="object-svg-container">
              ${renderObjectSvg(obj, testColor, 'warna', { size: 90 })}
            </div>
            <span class="mode-label">Warna</span>
          </div>
          <div class="mode-column">
            <div class="object-svg-container">
              ${renderObjectSvg(obj, testColor, 'siluet', { size: 90 })}
            </div>
            <span class="mode-label">Siluet</span>
          </div>
          <div class="mode-column">
            <div class="object-svg-container">
              ${renderObjectSvg(obj, testColor, 'garis', { size: 90 })}
            </div>
            <span class="mode-label">Garis</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// TAB 2: 28 Objek x 8 Warna Palet
// -------------------------------------------------------------
function renderColorsTab(root: HTMLElement): void {
  const pickerContainer = root.querySelector('#palette-picker');
  const labelEl = root.querySelector('#current-color-label');
  const gridContainer = root.querySelector('#colors-grid');
  if (!pickerContainer || !gridContainer || !labelEl) return;

  let activeColorKey: PaletteColorKey = 'merah';

  const updatePaletteView = (key: PaletteColorKey) => {
    activeColorKey = key;
    const hex = PALETTE[key];
    labelEl.textContent = `Menampilkan 28 objek dengan warna: ${key.toUpperCase()} (${hex})`;

    // Update active state on buttons
    pickerContainer.querySelectorAll('.palette-swatch-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-color') === key);
    });

    // Render grid
    gridContainer.innerHTML = ALL_OBJECT_IDS.map((id) => {
      const obj = GRAPHIC_OBJECTS[id];
      return `
        <div class="object-card">
          <h3 class="object-card-title">${obj.name}</h3>
          <div class="object-svg-container">
            ${renderObjectSvg(obj, hex, 'warna', { size: 90 })}
          </div>
        </div>
      `;
    }).join('');
  };

  pickerContainer.innerHTML = (Object.keys(PALETTE) as PaletteColorKey[])
    .map((k) => {
      const hex = PALETTE[k];
      return `
        <button class="palette-swatch-btn ${k === activeColorKey ? 'active' : ''}" 
                data-color="${k}" 
                style="background-color: ${hex}; color: ${k === 'kuning' ? '#22232E' : '#FFFFFF'};" 
                title="${k} (${hex})">
          ✓
        </button>
      `;
    })
    .join('');

  pickerContainer.querySelectorAll<HTMLButtonElement>('.palette-swatch-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = btn.getAttribute('data-color') as PaletteColorKey;
      if (k) updatePaletteView(k);
    });
  });

  updatePaletteView(activeColorKey);
}

// -------------------------------------------------------------
// TAB 3: Uji Bebas Kemiripan (200x Iterasi)
// -------------------------------------------------------------
function setupSimilarityTab(root: HTMLElement): void {
  const btnAll = root.querySelector('#btn-run-sim-all');
  const btnSiluet = root.querySelector('#btn-run-sim-siluet');
  const btnGaris = root.querySelector('#btn-run-sim-garis');
  const statusEl = root.querySelector<HTMLElement>('#sim-test-status');
  const logEl = root.querySelector<HTMLElement>('#sim-test-log');

  const runTest = (pool: readonly (typeof ALL_OBJECT_IDS)[number][], count: number, label: string) => {
    if (!statusEl || !logEl) return;
    statusEl.textContent = `Menjalankan 200 percobaan untuk ${label}...`;
    statusEl.style.color = '#22232E';

    let totalViolations = 0;
    const violationReports: string[] = [];
    const sampleDraws: string[] = [];
    const testPrng = new PRNG(12345); // Seed deterministik untuk verifikasi

    for (let i = 1; i <= 200; i++) {
      try {
        const chosen = pilihBerbeda(pool, count, testPrng);
        const violations = verifikasiBebasKemiripan(chosen);
        if (violations.length > 0) {
          totalViolations += violations.length;
          violationReports.push(`[Uji #${i}]: ${violations.join('; ')} (Pilihan: ${chosen.join(', ')})`);
        }
        if (i <= 5 || i === 100 || i === 200) {
          sampleDraws.push(`[Uji #${i.toString().padStart(3, ' ')}]: [ ${chosen.join(', ')} ] -> BEBAS KONFLIK ✓`);
        }
      } catch (err: unknown) {
        totalViolations++;
        violationReports.push(`[Uji #${i} ERROR]: ${(err as Error).message}`);
      }
    }

    if (totalViolations === 0) {
      statusEl.textContent = `✓ HASIL SEMPURNA: 200/200 Percobaan Sukses Tanpa Pelanggaran Kemiripan! (${label})`;
      statusEl.style.color = '#166534'; // hijau tua
      logEl.innerHTML = `
=== STATUS: LULUS 100% ===
Kumpulan Diuji : ${label} (${pool.length} objek)
Jumlah Diambil : ${count} per soal
Total Percobaan: 200 kali

Sampel Hasil Acak yang Dihasilkan:
${sampleDraws.join('\n')}

Seluruh 200 set pilihan diverifikasi silang dengan 7 kelompok kemiripan:
TIDAK ADA SATU PUN objek dari cluster yang sama muncul bersamaan!
      `;
    } else {
      statusEl.textContent = `⚠ DITEMUKAN ${totalViolations} PELANGGARAN PADA ${label}!`;
      statusEl.style.color = '#991B1B';
      logEl.textContent = violationReports.join('\n');
    }
  };

  btnAll?.addEventListener('click', () => runTest(ALL_OBJECT_IDS, 4, 'Seluruh 28 Objek'));
  btnSiluet?.addEventListener('click', () => runTest(POOL_SILUET, 3, 'POOL_SILUET'));
  btnGaris?.addEventListener('click', () => runTest(POOL_GARIS, 3, 'POOL_GARIS'));
}

// -------------------------------------------------------------
// TAB 4: Penguji Input Sentuh Tablet
// -------------------------------------------------------------
function setupTouchTab(root: HTMLElement): void {
  const tapBtn = root.querySelector<HTMLElement>('#test-tap-btn');
  const indicator = root.querySelector<HTMLElement>('#tap-indicator');
  const logTableBody = root.querySelector<HTMLElement>('#log-table-body');
  const clearBtn = root.querySelector<HTMLElement>('#btn-clear-logs');

  let validTapCount = 0;

  if (tapBtn && indicator) {
    // Daftarkan menggunakan modul input sentuh resmi kita!
    registerTapTarget(tapBtn, (_e: PointerEvent) => {
      validTapCount++;
      indicator.textContent = `🎉 KETUKAN SAH DITERIMA! Total: ${validTapCount} kali.`;
      indicator.style.color = '#166534';
      tapBtn.style.transform = 'scale(1.06)';
      setTimeout(() => {
        tapBtn.style.transform = 'none';
      }, 150);
    });
  }

  // Pasang diagnostic listener untuk mencatat semua event ke tabel log
  addDiagnosticListener((entry: PointerDiagnosticLog) => {
    if (!logTableBody) return;

    // Bersihkan placeholder jika masih ada
    if (logTableBody.querySelector('td[colspan]')) {
      logTableBody.innerHTML = '';
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.id}</td>
      <td>${entry.time}</td>
      <td><strong>${entry.type}</strong></td>
      <td>${entry.pointerId}</td>
      <td>${entry.pointerType}</td>
      <td>${entry.width} x ${entry.height}</td>
      <td>${entry.isPrimary ? 'Ya' : 'Tidak'}</td>
      <td><span class="verdict-badge verdict-${entry.verdict}">${entry.verdict}</span></td>
      <td>${entry.reason}</td>
    `;

    logTableBody.prepend(row);

    // Batasi log maksimal 50 baris agar tidak membebani browser
    while (logTableBody.children.length > 50) {
      logTableBody.removeChild(logTableBody.lastChild!);
    }
  });

  clearBtn?.addEventListener('click', () => {
    if (logTableBody) {
      logTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: #9CA3AF; padding: 16px;">Log telah dikosongkan.</td>
        </tr>
      `;
    }
    if (indicator) {
      validTapCount = 0;
      indicator.textContent = 'Siap menerima sentuhan.';
      indicator.style.color = '#22232E';
    }
  });
}

// -------------------------------------------------------------
// TAB 6: Penguji Ukuran Kontak Nyata (Tablet)
// -------------------------------------------------------------
interface ContactRawLog {
  id: number;
  time: string;
  box: number;
  type: string;
  width: number;
  height: number;
  pressure: number;
  isPrimary: boolean;
  x: number;
  y: number;
}

function setupContactSizeTab(root: HTMLElement): void {
  const targets = root.querySelectorAll<HTMLElement>('.contact-box-target');
  const tableBody = root.querySelector<HTMLElement>('#contact-table-body');
  const statsText = root.querySelector<HTMLElement>('#contact-stats-text');
  const warningText = root.querySelector<HTMLElement>('#contact-warning-text');
  const btnCopy = root.querySelector<HTMLButtonElement>('#btn-copy-contact-json');
  const btnClear = root.querySelector<HTMLButtonElement>('#btn-clear-contact');

  const rawLogs: ContactRawLog[] = [];
  let counter = 1;

  function updateSummary() {
    if (!statsText || !warningText) return;
    if (rawLogs.length === 0) {
      statsText.textContent = 'Belum ada sentuhan pada kotak di atas.';
      warningText.style.display = 'none';
      return;
    }

    const widths = rawLogs.map((l) => l.width).sort((a, b) => a - b);
    const heights = rawLogs.map((l) => l.height).sort((a, b) => a - b);

    const minW = widths[0];
    const maxW = widths[widths.length - 1];
    const medW = widths[Math.floor(widths.length / 2)];

    const minH = heights[0];
    const maxH = heights[heights.length - 1];
    const medH = heights[Math.floor(heights.length / 2)];

    statsText.innerHTML = `
      Total Event: ${rawLogs.length} | 
      <strong>Width:</strong> Min = ${minW}px, Median = ${medW}px, Max = ${maxW}px | 
      <strong>Height:</strong> Min = ${minH}px, Median = ${medH}px, Max = ${maxH}px
    `;

    // Cek apakah perangkat selalu melaporkan width <= 1 & height <= 1
    const allOneByOne = rawLogs.length >= 5 && rawLogs.every((l) => l.width <= 1 && l.height <= 1);
    if (allOneByOne) {
      warningText.style.display = 'block';
      warningText.innerHTML = `
        <strong>⚠️ Perhatian Kompatibilitas Tablet:</strong> Browser ini secara konsisten melaporkan width = 1 & height = 1.
        Artinya, Contact Geometry API tidak didukung pada browser/perangkat ini.
        Palm rejection di perangkat ini secara otomatis bergantung pada aturan <em>pointerdown & pointerup di elemen yang sama</em> dan <em>jeda debounce</em>.
      `;
    } else {
      warningText.style.display = 'none';
    }
  }

  targets.forEach((target) => {
    target.addEventListener('pointerdown', (e: PointerEvent) => {
      const boxId = parseInt(target.getAttribute('data-box') || '1', 10);
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;

      const entry: ContactRawLog = {
        id: counter++,
        time: timeStr,
        box: boxId,
        type: e.pointerType,
        width: Math.round(e.width * 10) / 10,
        height: Math.round(e.height * 10) / 10,
        pressure: Math.round(e.pressure * 100) / 100,
        isPrimary: e.isPrimary,
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
      };

      rawLogs.push(entry);

      if (tableBody) {
        if (tableBody.querySelector('td[colspan]')) {
          tableBody.innerHTML = '';
        }
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${entry.id}</td>
          <td>${entry.time}</td>
          <td>Kotak ${entry.box}</td>
          <td>${entry.type}</td>
          <td><strong>${entry.width}</strong></td>
          <td><strong>${entry.height}</strong></td>
          <td>${entry.pressure}</td>
          <td>${entry.isPrimary ? 'Ya' : 'Tidak'}</td>
          <td>(${entry.x}, ${entry.y})</td>
        `;
        tableBody.prepend(row);
        while (tableBody.children.length > 30) {
          tableBody.removeChild(tableBody.lastChild!);
        }
      }

      updateSummary();
    });
  });

  btnCopy?.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(rawLogs, null, 2)).then(() => {
      const originalText = btnCopy.textContent;
      btnCopy.textContent = '✓ Tersalin!';
      setTimeout(() => {
        btnCopy.textContent = originalText;
      }, 1500);
    });
  });

  btnClear?.addEventListener('click', () => {
    rawLogs.length = 0;
    counter = 1;
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: #9CA3AF; padding: 16px;">Silakan sentuh salah satu dari 4 kotak target di atas.</td>
        </tr>
      `;
    }
    updateSummary();
  });
}
