import { describe, it, expect, vi } from 'vitest';
import { parseStorageReference, resolveStorageReferences, stableStorageReferences } from '../../src/lib/storageReferences';
import type { SupabaseClient } from '@supabase/supabase-js';

const origin = 'https://project.supabase.co';
const url = origin + '/storage/v1/object/public/tour-images/projects/A/pan.jpg';
function mockClient(error: unknown = null) {
  const sign = vi.fn().mockResolvedValue({ data: error ? null : { signedUrl: 'https://temporary.example/image?token=temporary' }, error });
  return { client: { storage: { from: vi.fn().mockReturnValue({ createSignedUrl: sign }) } } as unknown as SupabaseClient, sign };
}
describe('Archivos privados y referencias persistentes', () => {
  it('interpreta URLs antiguas y firmadas solo del servidor propio', () => {
    expect(parseStorageReference(url, origin)).toEqual({ bucket: 'tour-images', path: 'projects/A/pan.jpg' });
    expect(parseStorageReference(url.replace('/public/', '/sign/') + '?token=secret', origin)).toEqual({ bucket: 'tour-images', path: 'projects/A/pan.jpg' });
    expect(parseStorageReference(url.replace(origin, 'https://otra.example'), origin)).toBeNull();
    expect(parseStorageReference('https://project.supabase.co/storage/v1/object/public/otro/file.jpg', origin)).toBeNull();
  });
  it('conserva espacios y caracteres internacionales al guardar sin persistir tokens', () => {
    const value = { rooms: [{ imageUrl: origin + '/storage/v1/object/sign/tour-images/projects/A/BA%C3%91O%202.png?token=secret' }] };
    expect(stableStorageReferences(value, origin)).toEqual({ rooms: [{ imageUrl: origin + '/storage/v1/object/public/tour-images/projects/A/BAÑO 2.png' }] });
    expect(JSON.stringify(value)).toContain('token=secret'); // No mutar el borrador original.
  });
  it('firma una sola vez cada referencia repetida en una lectura', async () => {
    const { client, sign } = mockClient();
    const data = await resolveStorageReferences(client, { thumbnail: url, rooms: [{ imageUrl: url }] }, origin);
    expect(sign).toHaveBeenCalledTimes(1);
    expect(sign).toHaveBeenCalledWith('projects/A/pan.jpg', 300);
    expect(data.thumbnail).toContain('temporary');
    expect(data.rooms[0].imageUrl).toEqual(data.thumbnail);
  });
  it('no retorna una URL pública cuando RLS deniega la firma', async () => {
    const { client } = mockClient({ message: 'not found or forbidden' });
    expect(await resolveStorageReferences(client, url, origin)).toBe('');
  });
  it('no comparte firmas entre lecturas o sesiones', async () => {
    const { client, sign } = mockClient();
    await resolveStorageReferences(client, url, origin);
    await resolveStorageReferences(client, url, origin);
    expect(sign).toHaveBeenCalledTimes(2);
  });
  it('firma rutas relativas de la bóveda cuando se indica el bucket', async () => {
    const { client, sign } = mockClient();
    await resolveStorageReferences(client, { storage_path: 'projects/A/plano.pdf' }, origin, 'project-vault');
    expect(sign).toHaveBeenCalledWith('projects/A/plano.pdf', 300);
  });
  it('conserva assets locales y externos sin solicitar firmas', async () => {
    const { client, sign } = mockClient();
    const data = { image: '/local.png', video: 'https://external.example/video.mp4', blank: '', number: 0, empty: null };
    expect(await resolveStorageReferences(client, data, origin)).toEqual(data);
    expect(sign).not.toHaveBeenCalled();
  });
});
