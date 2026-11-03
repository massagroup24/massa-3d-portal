import * as THREE from 'three';
import { getPanoramaSource } from './panoramaSource';

export function getPanoramaDimensions(width: number, height: number, maxTextureSize: number, touchDevice: boolean) {
  if (![width, height, maxTextureSize].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error('La imagen panorámica no tiene dimensiones válidas.');
  }
  const limit = Math.min(Math.floor(maxTextureSize), touchDevice ? 2048 : 8192);
  if (limit < 1) throw new Error('No se pudo determinar el tamaño de textura disponible.');
  const scale = Math.min(1, limit / width, limit / height);
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) };
}

export function loadPanoramaTexture(url: string, maxTextureSize: number, touchDevice: boolean, signal: AbortSignal): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Carga cancelada', 'AbortError')); return; }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    let settled = false;
    const cleanup = () => {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
      image.onload = null;
      image.onerror = null;
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      image.removeAttribute('src');
      reject(error);
    };
    const abort = () => fail(new DOMException('Carga cancelada', 'AbortError'));
    const timeout = setTimeout(() => fail(new Error('La imagen está tardando demasiado en cargar.')), 30000);
    signal.addEventListener('abort', abort, { once: true });
    const sourceUrl = getPanoramaSource(url, touchDevice);
    let usingMobileCopy = sourceUrl !== url;
    image.onerror = () => {
      // Una copia móvil ausente no debe romper un recorrido ya publicado.
      if (usingMobileCopy) {
        usingMobileCopy = false;
        image.src = new URL(url, window.location.href).href;
      } else fail(new Error('No se pudo cargar la imagen del ambiente.'));
    };
    image.onload = () => {
      if (settled) return;
      try {
        const size = getPanoramaDimensions(image.naturalWidth, image.naturalHeight, maxTextureSize, touchDevice);
        let source: HTMLImageElement | HTMLCanvasElement = image;
        if (size.width !== image.naturalWidth || size.height !== image.naturalHeight) {
          const canvas = document.createElement('canvas');
          canvas.width = size.width;
          canvas.height = size.height;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('No se pudo preparar la imagen del ambiente.');
          context.drawImage(image, 0, 0, size.width, size.height);
          source = canvas;
        }
        const texture = new THREE.Texture(source);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.addEventListener('dispose', () => {
          if (source !== image) { source.width = 1; source.height = 1; }
          image.removeAttribute('src');
        });
        texture.needsUpdate = true;
        settled = true;
        cleanup();
        resolve(texture);
      } catch (error) { fail(error instanceof Error ? error : new Error('Imagen no disponible.')); }
    };
    try {
      // URL conserva los escapes y firmas existentes; encodeURI los codifica dos veces.
      image.src = new URL(sourceUrl, window.location.href).href;
    } catch { fail(new Error('La dirección de la imagen no es válida.')); }
  });
}
