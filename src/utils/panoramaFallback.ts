/**
 * Utilidad de generación y validación de texturas panorámicas 360° para MASSA VIEW.
 * Garantiza que NUNCA colapse el visor 3D incluso si una imagen no existe o tiene error 404.
 */

let cachedProceduralPanorama: string | null = null;

export function generateProceduralPanorama(roomName: string = 'Ambiente Arquitectónico'): string {
  if (cachedProceduralPanorama && !roomName) {
    return cachedProceduralPanorama;
  }

  if (typeof document === 'undefined') {
    return '';
  }

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // 1. Fondo cielo crepuscular y horizonte
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.52);
  skyGradient.addColorStop(0, '#090B10');
  skyGradient.addColorStop(0.4, '#121722');
  skyGradient.addColorStop(0.75, '#28242E');
  skyGradient.addColorStop(1, '#66453A');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height * 0.52);

  // 2. Silueta de montañas lejanas en el horizonte (Calima / Cordillera)
  ctx.fillStyle = '#11141A';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.52);
  for (let x = 0; x <= width; x += 40) {
    const y = height * 0.48 - Math.sin((x / width) * Math.PI * 4) * 28 - Math.cos((x / width) * Math.PI * 8) * 14;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height * 0.52);
  ctx.closePath();
  ctx.fill();

  // 3. Suelo de hormigón arquitectónico pulido con reflejos
  const floorGradient = ctx.createLinearGradient(0, height * 0.52, 0, height);
  floorGradient.addColorStop(0, '#1E2024');
  floorGradient.addColorStop(0.3, '#141618');
  floorGradient.addColorStop(1, '#08080A');
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, height * 0.52, width, height * 0.48);

  // Rejilla de juntas de gran formato en el suelo
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;
  for (let i = 0; i < width; i += 180) {
    ctx.beginPath();
    ctx.moveTo(i, height * 0.52);
    ctx.lineTo(i + (i - width / 2) * 1.5, height);
    ctx.stroke();
  }
  for (let y = height * 0.54; y < height; y += (y - height * 0.5) * 0.65 + 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 4. Techo de vigas horizontales en voladizo (Concreto ocre / Madera de teca)
  const ceilingGradient = ctx.createLinearGradient(0, 0, 0, height * 0.35);
  ceilingGradient.addColorStop(0, '#0E0F12');
  ceilingGradient.addColorStop(0.7, '#181A1F');
  ceilingGradient.addColorStop(1, '#25272D');
  ctx.fillStyle = ceilingGradient;
  ctx.fillRect(0, 0, width, height * 0.32);

  // Rieles de luz cálida LED en el cielo falso
  ctx.strokeStyle = 'rgba(230, 245, 180, 0.4)';
  ctx.lineWidth = 5;
  for (let x = 200; x < width; x += 400) {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, height * 0.28);
    ctx.stroke();
  }

  // 5. Paredes arquitectónicas y ventanales panorámicos de piso a techo
  ctx.fillStyle = 'rgba(12, 13, 16, 0.92)';
  // Columna / Muro izquierdo
  ctx.fillRect(100, height * 0.28, 160, height * 0.38);
  // Columna / Muro central con logo
  const centerWallX = width * 0.42;
  const centerWallW = width * 0.16;
  ctx.fillRect(centerWallX, height * 0.24, centerWallW, height * 0.44);

  // Marco de ventanería ultradelgada de piso a techo
  ctx.strokeStyle = '#2A2C32';
  ctx.lineWidth = 4;
  ctx.strokeRect(centerWallX - 350, height * 0.24, 350, height * 0.44);
  ctx.strokeRect(centerWallX + centerWallW, height * 0.24, 350, height * 0.44);

  // 6. Tipografía y Branding de Ultralujo en el Muro de Acento
  ctx.fillStyle = '#9CD01A';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MASSA GROUP // RESIDENCIA DE AUTOR', centerWallX + centerWallW / 2, height * 0.36);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText(roomName.toUpperCase(), centerWallX + centerWallW / 2, height * 0.44);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '16px monospace';
  ctx.fillText('RECORRIDO 360° INTERACTIVO • GEMELO DIGITAL', centerWallX + centerWallW / 2, height * 0.49);

  // Pequeña luz de acento verde lime en el zócalo
  ctx.fillStyle = 'rgba(156, 208, 26, 0.6)';
  ctx.fillRect(centerWallX + 30, height * 0.67, centerWallW - 60, 4);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  cachedProceduralPanorama = dataUrl;
  return dataUrl;
}

// Caché de URLs verificadas
const verifiedUrlCache = new Map<string, string>();

/**
 * Verifica si una URL de imagen existe y carga correctamente.
 * Si falla (404, CORS o timeout), retorna la textura panorámica de respaldo generada.
 */
export async function getVerifiedPanoramaUrl(rawUrl?: string, roomName?: string): Promise<string> {
  if (!rawUrl || !rawUrl.trim()) {
    return generateProceduralPanorama(roomName);
  }

  const cleanUrl = rawUrl.trim();
  if (verifiedUrlCache.has(cleanUrl)) {
    return verifiedUrlCache.get(cleanUrl)!;
  }

  // Si es un data URL ya es seguro
  if (cleanUrl.startsWith('data:image')) {
    verifiedUrlCache.set(cleanUrl, cleanUrl);
    return cleanUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    let isResolved = false;

    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        const fallback = generateProceduralPanorama(roomName);
        verifiedUrlCache.set(cleanUrl, fallback);
        resolve(fallback);
      }
    }, 3500);

    img.onload = () => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        verifiedUrlCache.set(cleanUrl, cleanUrl);
        resolve(cleanUrl);
      }
    };

    img.onerror = () => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        console.warn(`[MASSA 3D] La imagen 360 "${cleanUrl}" no pudo cargarse (404 o red). Usando panorama arquitectónico resiliente.`);
        const fallback = generateProceduralPanorama(roomName);
        verifiedUrlCache.set(cleanUrl, fallback);
        resolve(fallback);
      }
    };

    img.src = cleanUrl;
  });
}
