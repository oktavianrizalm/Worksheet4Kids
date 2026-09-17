// Script untuk menghasilkan HTML preview dan tangkapan layar PNG 12 objek POOL_WARNA_MURNI
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { GRAPHIC_OBJECTS } from '../src/graphics/objects.ts';
import { renderObjek } from '../src/graphics/render-aman.ts';
import { POOL_WARNA_MURNI } from '../src/random/similarity.ts';
import { PALETTE } from '../src/tokens.ts';

const artifactDir = 'C:\\Users\\oktav\\.gemini\\antigravity\\brain\\9d6ea641-2b40-48b5-b700-486ec007789a';
const htmlPath = path.join(artifactDir, 'pool_warna_murni.html');
const pngPath = path.join(artifactDir, 'pool_warna_murni.png');

const colors = ['merah', 'biru', 'kuning'];

let cardsHtml = '';

for (const id of POOL_WARNA_MURNI) {
  const obj = GRAPHIC_OBJECTS[id];
  cardsHtml += `
    <div style="background: #FFFFFF; border: 3px solid #22232E; border-radius: 16px; padding: 12px; box-shadow: 4px 4px 0 #22232E; display: flex; flex-direction: column; align-items: center; gap: 8px;">
      <h3 style="font-size: 14px; font-weight: 800; color: #22232E; margin: 0;">${obj.name} (${id})</h3>
      <div style="display: flex; gap: 8px;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 75px; height: 75px; display: flex; align-items: center; justify-content: center; border: 1px dashed #D1D5DB; border-radius: 8px;">
            ${renderObjek(id, 'merah', 'warna', { size: 68 })}
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #E8332F; margin-top: 2px;">Merah</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 75px; height: 75px; display: flex; align-items: center; justify-content: center; border: 1px dashed #D1D5DB; border-radius: 8px;">
            ${renderObjek(id, 'biru', 'warna', { size: 68 })}
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #2B80D9; margin-top: 2px;">Biru</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 75px; height: 75px; display: flex; align-items: center; justify-content: center; border: 1px dashed #D1D5DB; border-radius: 8px;">
            ${renderObjek(id, 'kuning', 'warna', { size: 68 })}
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #D97706; margin-top: 2px;">Kuning</span>
        </div>
      </div>
    </div>
  `;
}

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Verifikasi 12 Objek POOL_WARNA_MURNI</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #F3F4F6;
      margin: 0;
      padding: 24px;
      color: #22232E;
    }
    .header {
      margin-bottom: 20px;
      border-bottom: 3px solid #22232E;
      padding-bottom: 12px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .note-box {
      background: #FFFFFF;
      border: 2px solid #22232E;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 13px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0 0 6px 0; font-size: 24px;">Verifikasi Visual 12 Objek POOL_WARNA_MURNI (Mode Warna)</h1>
    <p style="margin: 0; font-size: 14px; color: #4B5563;">
      Membuktikan seluruh 12 objek hanya memakai 1 warna palet murni (merah #E8332F, biru #2B80D9, kuning #FDCB1E) tanpa aksen alami. Perhatikan khusus <strong>bola</strong> (garis jahitan hanya stroke #22232E, isian tunggal) dan <strong>awan</strong> (isian tunggal).
    </p>
  </div>
  <div class="grid">
    ${cardsHtml}
  </div>
</body>
</html>`;

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('HTML saved to:', htmlPath);

try {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  const cmd = `"${chromePath}" --headless --disable-gpu --screenshot="${pngPath}" --window-size=1200,980 "${fileUrl}"`;
  console.log('Taking headless Chrome screenshot...');
  execSync(cmd, { stdio: 'inherit' });
  console.log('Screenshot saved to:', pngPath);
} catch (e) {
  console.error('Failed to take screenshot:', e.message);
}
