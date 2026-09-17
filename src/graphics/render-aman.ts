import { ObjectId, RenderMode } from './types';
import { PaletteColorKey, PALETTE } from '../tokens';
import { GRAPHIC_OBJECTS } from './objects';
import { renderObjectSvg } from './renderer';

/**
 * Wrapper render aman yang mewajibkan warna berasal dari PaletteColorKey.
 * Hanya wrapper ini yang boleh dipanggil dari src/latihan/** untuk mencegah
 * pemanggilan warna bebas di luar palet 8 warna resmi.
 */
export function renderObjek(
  id: ObjectId,
  warna: PaletteColorKey,
  mode: RenderMode,
  opts?: { size?: number; className?: string; ariaLabel?: string }
): string {
  const obj = GRAPHIC_OBJECTS[id];
  if (!obj) {
    throw new Error(`Objek dengan id "${id}" tidak ditemukan dalam GRAPHIC_OBJECTS.`);
  }
  const colorHex = PALETTE[warna];
  return renderObjectSvg(obj, colorHex, mode, opts);
}
