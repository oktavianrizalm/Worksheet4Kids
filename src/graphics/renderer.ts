import { GraphicObjectDefinition, RenderMode, SvgElementDesc } from './types';
import { TOKENS } from '../tokens';

/**
 * Menghasilkan markup string SVG utuh berukuran 100x100
 */
export function renderObjectSvg(
  obj: GraphicObjectDefinition,
  colorHex: string,
  mode: RenderMode,
  options: {
    size?: number;
    className?: string;
    ariaLabel?: string;
  } = {}
): string {
  const { size = 100, className = 'object-svg', ariaLabel = obj.name } = options;
  const strokeColor = TOKENS.object.strokeColor; // #22232E
  const strokeWidth = TOKENS.object.strokeWidth; // 3
  const silhouetteColor = TOKENS.object.silhouetteColor; // #22232E

  const elementsHtml = obj.parts
    .map((part) => {
      // Pada mode siluet, garis detail dalam (detail-stroke) diabaikan agar tidak bocor
      if (mode === 'siluet' && part.role === 'detail-stroke') {
        return '';
      }

      const { fill, stroke, strokeWidthVal } = getFillAndStroke(
        part,
        colorHex,
        mode,
        strokeColor,
        strokeWidth,
        silhouetteColor
      );

      const attrsObj: Record<string, string | number> = {
        ...part.attrs,
        fill,
      };

      if (!part.noStroke && stroke !== 'none') {
        attrsObj.stroke = stroke;
        attrsObj['stroke-width'] = strokeWidthVal;
        attrsObj['stroke-linecap'] = 'round';
        attrsObj['stroke-linejoin'] = 'round';
      }

      const attrsString = Object.entries(attrsObj)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');

      return `<${part.tag} ${attrsString} />`;
    })
    .join('');

  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="${className}" role="img" aria-label="${ariaLabel}" xmlns="http://www.w3.org/2000/svg">${elementsHtml}</svg>`;
}

function getFillAndStroke(
  part: SvgElementDesc,
  colorHex: string,
  mode: RenderMode,
  strokeColor: string,
  strokeWidth: number,
  silhouetteColor: string
): { fill: string; stroke: string; strokeWidthVal: number } {
  if (mode === 'siluet') {
    // Mode Siluet: SEMUA bagian ditimpa menjadi satu warna abu-abu/hitam solid (#22232E)
    return {
      fill: silhouetteColor,
      stroke: silhouetteColor,
      strokeWidthVal: strokeWidth,
    };
  }

  if (mode === 'garis') {
    // Mode Garis: SEMUA isian menjadi putih (#FFFFFF), garis tepi #22232E
    if (part.role === 'detail-stroke') {
      return {
        fill: 'none',
        stroke: strokeColor,
        strokeWidthVal: strokeWidth,
      };
    }
    return {
      fill: '#FFFFFF',
      stroke: strokeColor,
      strokeWidthVal: strokeWidth,
    };
  }

  // Mode Warna
  switch (part.role) {
    case 'primary':
      return {
        fill: colorHex,
        stroke: strokeColor,
        strokeWidthVal: strokeWidth,
      };
    case 'accent':
      return {
        fill: part.accentColor || colorHex,
        stroke: strokeColor,
        strokeWidthVal: strokeWidth,
      };
    case 'detail-fill':
      return {
        fill: part.detailColor || '#FFFFFF',
        stroke: strokeColor,
        strokeWidthVal: strokeWidth,
      };
    case 'detail-stroke':
      return {
        fill: 'none',
        stroke: strokeColor,
        strokeWidthVal: strokeWidth,
      };
  }
}
