import { PaletteColorKey, PaletteColorHex } from '../tokens';

export type { PaletteColorKey, PaletteColorHex };

export type ShapeId =
  | 'lingkaran'
  | 'kotak'
  | 'segitiga'
  | 'bintang'
  | 'hati'
  | 'ketupat';

export type ThingId =
  | 'apel'
  | 'balon'
  | 'ikan'
  | 'kupu_kupu'
  | 'matahari'
  | 'awan'
  | 'pohon'
  | 'rumah'
  | 'mobil'
  | 'gelas'
  | 'es_krim'
  | 'payung'
  | 'bola'
  | 'daun'
  | 'perahu'
  | 'jamur'
  | 'topi'
  | 'kue'
  | 'telur'
  | 'bunga'
  | 'bulan'
  | 'kunci';

export type ObjectId = ShapeId | ThingId;

export type RenderMode = 'warna' | 'siluet' | 'garis';

/**
 * Peran bagian dalam suatu objek:
 * - 'primary'      : bagian tubuh utama. Pada mode warna memakai colorHex yang diminta.
 * - 'accent'       : aksen alami (daun apel, kerucut es krim, roda mobil, dll).
 *                    Pada mode warna memakai accentColor khusus.
 *                    PADA MODE SILUET & GARIS WAJIB DITIMPA menjadi siluet/putih!
 * - 'detail-fill'  : isian detail (seperti pupil mata, titik jamur, lilin).
 * - 'detail-stroke': garis kontur dalam (urat daun, garis bola, lengkung insang).
 */
export type PartRole = 'primary' | 'accent' | 'detail-fill' | 'detail-stroke';

export interface SvgElementDesc {
  tag: 'path' | 'circle' | 'rect' | 'ellipse' | 'polygon' | 'line';
  attrs: Record<string, string | number>;
  role: PartRole;
  accentColor?: string;
  detailColor?: string;
  noStroke?: boolean;
}

export interface GraphicObjectDefinition {
  id: ObjectId;
  name: string;
  category: 'bentuk' | 'benda';
  parts: SvgElementDesc[];
}
