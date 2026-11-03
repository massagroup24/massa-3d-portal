import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import mobilePanoramas from '../../src/config/mobilePanoramas.json';
import { getPanoramaSource } from '../../src/utils/panoramaSource';

describe('Selección de panoramas para móvil', () => {
  const original = '/HACIENDA F22/360/ZONA SOCIAL.jpg';
  it('elige la misma escena optimizada con rutas normales o escapadas', () => {
    expect(getPanoramaSource(original, true)).toBe('/panoramas/mobile/hacienda-f22/zona-social.jpg');
    expect(getPanoramaSource(encodeURI(original), true)).toBe(getPanoramaSource(original, true));
  });
  it('conserva la imagen original en escritorio', () => {
    expect(getPanoramaSource(original, false)).toBe(original);
  });
  it.each([
    'https://private.supabase.co/storage/v1/object/sign/tour-images/pano.jpg?token=abc%2Fdef',
    'https://other.example/HACIENDA%20F22/360/ZONA%20SOCIAL.jpg',
    '//other.example/HACIENDA%20F22/360/ZONA%20SOCIAL.jpg',
    `${original}?token=abc`, '/new-panorama.jpg', '/invalid%escape.jpg',
  ])('no sustituye firmas, URLs remotas ni archivos sin variante: %s', url => {
    expect(getPanoramaSource(url, true)).toBe(url);
  });

  it.each(Object.entries(mobilePanoramas))('incluye en el despliegue una copia 2:1 ligera de %s', (source, mobile) => {
    const publicPath = (url: string) => resolve('public', `.${url}`);
    const bytes = readFileSync(publicPath(mobile));
    expect(bytes.readUInt16BE(0)).toBe(0xffd8); // JPEG, sin dependencia del conversor durante el build.
    let dimensions: number[] | undefined;
    for (let offset = 2; offset < bytes.length - 8;) {
      const marker = bytes.readUInt16BE(offset);
      if ([0xffc0, 0xffc1, 0xffc2].includes(marker)) {
        dimensions = [bytes.readUInt16BE(offset + 7), bytes.readUInt16BE(offset + 5)];
        break;
      }
      offset += 2 + bytes.readUInt16BE(offset + 2);
    }
    expect(dimensions).toEqual([2048, 1024]);
    expect(bytes.length).toBeLessThan(statSync(publicPath(source)).size * 0.2);
  });
});
