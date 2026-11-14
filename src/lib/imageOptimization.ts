/**
 * Devuelve la variante WebP optimizada (~1920px) para carga rápida en carruseles y vistas previas,
 * manteniendo las imágenes 4K/5K originales intactas para ampliación y pantalla completa.
 */
export function getOptimizedWebpUrl(url?: string | null): string {
  if (!url) return '';
  const match = url.match(/^\/(IBIZA A14|HACIENDA F22|PLANOS 2D F22)\/([^/]+)\.(png|jpe?g)$/i);
  if (match) {
    const [, folder, name] = match;
    return `/${folder}/web/${name}.webp`;
  }
  return url;
}

