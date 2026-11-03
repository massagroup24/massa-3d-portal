import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPanoramaDimensions, loadPanoramaTexture } from '../../src/utils/panoramaTexture';

describe('Presupuesto de texturas del recorrido 360°', () => {
  it('reduce un panorama grande en móvil sin deformar su proporción', () => {
    expect(getPanoramaDimensions(12000, 6000, 16384, true)).toEqual({ width: 2048, height: 1024 });
  });
  it('respeta un límite de GPU inferior al presupuesto móvil', () => {
    expect(getPanoramaDimensions(8192, 4096, 1024, true)).toEqual({ width: 1024, height: 512 });
  });
  it('permite mayor resolución en escritorio y no amplía imágenes pequeñas', () => {
    expect(getPanoramaDimensions(12000, 6000, 16384, false)).toEqual({ width: 8192, height: 4096 });
    expect(getPanoramaDimensions(1920, 960, 8192, false)).toEqual({ width: 1920, height: 960 });
  });
  it('limita también imágenes altas para evitar tamaños incompatibles', () => {
    expect(getPanoramaDimensions(4000, 8000, 16384, true)).toEqual({ width: 1024, height: 2048 });
  });
  it.each([[0, 4000, 8192], [8000, 0, 8192], [NaN, 1000, 8192], [4000, Infinity, 8192], [4000, 2000, 0]])('rechaza dimensiones inválidas %s/%s/%s', (width, height, limit) => {
    expect(() => getPanoramaDimensions(width, height, limit, true)).toThrow();
  });
});

class ImageStub {
  static instances: ImageStub[] = [];
  naturalWidth = 12000;
  naturalHeight = 6000;
  crossOrigin = '';
  decoding = '';
  src = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  removeAttribute = vi.fn();
  constructor() { ImageStub.instances.push(this); }
}

describe('Carga y recuperación de panoramas en conexiones móviles', () => {
  const drawImage = vi.fn();
  let canvas: { width: number; height: number; getContext: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    vi.useFakeTimers();
    ImageStub.instances = [];
    drawImage.mockClear();
    canvas = { width: 0, height: 0, getContext: vi.fn(() => ({ drawImage })) };
    vi.stubGlobal('Image', ImageStub);
    vi.stubGlobal('document', { createElement: vi.fn(() => canvas) });
    vi.stubGlobal('window', { location: { href: 'https://massa.example/proyecto/hacienda-f22' } });
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  it('prepara una textura móvil acotada sin mipmaps antes de enviarla a la GPU', async () => {
    const pending = loadPanoramaTexture('/HACIENDA F22/pano.jpg', 16384, true, new AbortController().signal);
    const image = ImageStub.instances[0];
    image.onload?.();
    const texture = await pending;
    expect(texture.image).toBe(canvas);
    expect([canvas.width, canvas.height]).toEqual([2048, 1024]);
    expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 2048, 1024);
    expect(texture.generateMipmaps).toBe(false);
    expect(image.crossOrigin).toBe('anonymous');
    texture.dispose();
    expect([canvas.width, canvas.height]).toEqual([1, 1]);
    expect(image.removeAttribute).toHaveBeenCalledWith('src');
  });
  it('descarga directamente la copia ligera de F22 y conserva la original como respaldo', async () => {
    const pending = loadPanoramaTexture('/HACIENDA F22/360/ZONA SOCIAL.jpg', 8192, true, new AbortController().signal);
    const image = ImageStub.instances[0];
    expect(image.src).toBe('https://massa.example/panoramas/mobile/hacienda-f22/zona-social.jpg');
    image.onerror?.();
    expect(image.src).toBe('https://massa.example/HACIENDA%20F22/360/ZONA%20SOCIAL.jpg');
    image.onerror?.();
    await expect(pending).rejects.toThrow('No se pudo cargar');
  });
  it('conserva escapes y firmas de URLs existentes sin doble codificación', async () => {
    const url = 'https://project.supabase.co/storage/v1/object/sign/tour-images/SALA%20F22.jpg?token=abc%2Fdef%3D';
    const pending = loadPanoramaTexture(url, 8192, true, new AbortController().signal);
    expect(ImageStub.instances[0].src).toBe(url);
    ImageStub.instances[0].onerror?.();
    await expect(pending).rejects.toThrow('No se pudo cargar');
  });
  it('propaga un fallo de red en vez de presentar un panorama de otro proyecto', async () => {
    const pending = loadPanoramaTexture('/missing.jpg', 8192, true, new AbortController().signal);
    ImageStub.instances[0].onerror?.();
    await expect(pending).rejects.toThrow('No se pudo cargar');
    expect(drawImage).not.toHaveBeenCalled();
  });
  it('termina la espera para permitir reintentar en una conexión interrumpida', async () => {
    const pending = loadPanoramaTexture('/slow.jpg', 8192, true, new AbortController().signal);
    const rejected = expect(pending).rejects.toThrow('tardando demasiado');
    await vi.advanceTimersByTimeAsync(30000);
    await rejected;
    expect(ImageStub.instances[0].onload).toBeNull();
    expect(ImageStub.instances[0].removeAttribute).toHaveBeenCalledWith('src');
  });
  it('cancela la carga anterior al cambiar de ambiente o salir del visor', async () => {
    const controller = new AbortController();
    const pending = loadPanoramaTexture('/previous.jpg', 8192, true, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(ImageStub.instances[0].onload).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('no inicia descargas para una solicitud ya cancelada', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(loadPanoramaTexture('/previous.jpg', 8192, true, controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(ImageStub.instances).toHaveLength(0);
  });
  it('informa si el dispositivo no puede preparar la imagen reducida', async () => {
    canvas.getContext.mockReturnValue(null as any);
    const pending = loadPanoramaTexture('/large.jpg', 8192, true, new AbortController().signal);
    ImageStub.instances[0].onload?.();
    await expect(pending).rejects.toThrow('preparar la imagen');
  });
});
