export type ProjectShareResult = 'shared' | 'copied' | 'cancelled' | 'manual';

interface ProjectShareCapabilities {
  share?: (data: ShareData) => Promise<void>;
  writeText?: (text: string) => Promise<void>;
}

export function getProjectShareUrl(slug: string, origin: string): string {
  return new URL(`/proyecto/${encodeURIComponent(slug)}`, origin).href;
}

export async function shareProjectLink(data: ShareData & { url: string }, capabilities: ProjectShareCapabilities): Promise<ProjectShareResult> {
  if (capabilities.share) {
    try {
      await capabilities.share(data);
      return 'shared';
    } catch (error) {
      // Cancelar el menú del dispositivo no debe copiar el enlace sin avisar.
      if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError') return 'cancelled';
    }
  }

  if (capabilities.writeText) {
    try {
      await capabilities.writeText(data.url);
      return 'copied';
    } catch {
      // El enlace sigue disponible para copiarlo manualmente.
    }
  }
  return 'manual';
}
