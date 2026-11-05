import { describe, expect, it, vi } from 'vitest';
import { getProjectShareUrl, shareProjectLink } from '../../src/utils/projectSharing';

const data = {
  title: 'HACIENDA CLUB F22 | AMHO CONSTRUCCIONES',
  url: 'https://example.com/proyecto/hacienda-f22',
};

describe('Enlace directo del proyecto', () => {
  it('usa la presentación canónica sin conservar consultas ni anclas de navegación', () => {
    expect(getProjectShareUrl('hacienda-f22', 'https://example.com/proyecto/f22?preview=1#galeria')).toBe(data.url);
    expect(getProjectShareUrl('ibiza-a14', 'https://example.com')).toBe('https://example.com/proyecto/ibiza-a14');
  });

  it('comparte con el dispositivo cuando está disponible', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    expect(await shareProjectLink(data, { share, writeText })).toBe('shared');
    expect(share).toHaveBeenCalledWith(data);
    expect(writeText).not.toHaveBeenCalled();
  });

  it('respeta la cancelación del usuario sin copiar el enlace', async () => {
    const share = vi.fn().mockRejectedValue({ name: 'AbortError' });
    const writeText = vi.fn();
    expect(await shareProjectLink(data, { share, writeText })).toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copia el enlace si no hay menú de compartir', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareProjectLink(data, { writeText })).toBe('copied');
    expect(writeText).toHaveBeenCalledWith(data.url);
  });

  it('copia el enlace si el sistema rechaza compartir', async () => {
    const share = vi.fn().mockRejectedValue(new Error('Not allowed'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareProjectLink(data, { share, writeText })).toBe('copied');
    expect(writeText).toHaveBeenCalledWith(data.url);
  });

  it('ofrece copia manual si el portapapeles está bloqueado', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'));
    expect(await shareProjectLink(data, { writeText })).toBe('manual');
    expect(await shareProjectLink(data, {})).toBe('manual');
  });
});
