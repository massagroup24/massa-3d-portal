import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKETS = new Set(['tour-images', 'project-vault']);

export function parseStorageReference(value: string, origin: string, defaultBucket?: string) {
  try {
    const url = new URL(value);
    if (url.origin !== origin) return null;
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/);
    if (!match || !BUCKETS.has(match[1])) return null;
    return { bucket: match[1], path: decodeURIComponent(match[2]) };
  } catch {
    return defaultBucket && BUCKETS.has(defaultBucket) && value.startsWith('projects/')
      ? { bucket: defaultBucket, path: value } : null;
  }
}

export function stableStorageReferences<T>(value: T, origin: string): T {
  if (typeof value === 'string') {
    const ref = parseStorageReference(value, origin);
    return (ref ? `${origin}/storage/v1/object/public/${ref.bucket}/${ref.path}` : value) as T;
  }
  if (Array.isArray(value)) return value.map(item => stableStorageReferences(item, origin)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .map(([key, item]) => [key, stableStorageReferences(item, origin)])) as T;
  return value;
}

// No se comparten URLs firmadas entre sesiones. Cada lectura consulta RLS de nuevo.
export async function resolveStorageReferences<T>(client: SupabaseClient, value: T, origin: string, defaultBucket?: string): Promise<T> {
  const requests = new Map<string, Promise<string>>();
  async function resolve(item: unknown): Promise<unknown> {
    if (typeof item === 'string') {
      const ref = parseStorageReference(item, origin, defaultBucket);
      if (!ref) return item;
      const key = `${ref.bucket}/${ref.path}`;
      if (!requests.has(key)) requests.set(key, (async () => {
        const { data, error } = await client.storage.from(ref.bucket).createSignedUrl(ref.path, 300);
        if (error || !data?.signedUrl) return ''; // Nunca usar como respaldo la URL pública anterior.
        return data.signedUrl;
      })());
      return requests.get(key);
    }
    if (Array.isArray(item)) return Promise.all(item.map(resolve));
    if (item && typeof item === 'object') return Object.fromEntries(await Promise.all(Object.entries(item)
      .map(async ([key, entry]) => [key, await resolve(entry)])));
    return item;
  }
  return await resolve(value) as T;
}
