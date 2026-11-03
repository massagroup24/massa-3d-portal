import mobilePanoramas from '../config/mobilePanoramas.json';

// Solo sustituye archivos locales conocidos. Las URLs privadas/remotas conservan
// su origen, permisos y firma; nunca se convierten en una copia pública.
export function getPanoramaSource(url: string, touchDevice: boolean): string {
  if (!touchDevice || !url.startsWith('/') || url.startsWith('//')) return url;
  try {
    if (url.includes('?') || url.includes('#')) return url;
    return (mobilePanoramas as Record<string, string>)[decodeURIComponent(url)] || url;
  } catch { return url; }
}
