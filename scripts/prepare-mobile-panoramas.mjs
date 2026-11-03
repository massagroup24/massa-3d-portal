// Ejecutar una vez al actualizar las fotos F22 y versionar los resultados.
// El build de Vercel no necesita volver a convertir las imágenes.
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDirectory = path.join(root, 'public/HACIENDA F22/360');
const outputDirectory = path.join(root, 'public/panoramas/mobile/hacienda-f22');
await mkdir(outputDirectory, { recursive: true });
const manifest = {};
let originalBytes = 0;
let mobileBytes = 0;
for (const filename of (await readdir(sourceDirectory)).filter(name => /\.jpg$/i.test(name)).sort()) {
  const source = path.join(sourceDirectory, filename);
  const outputName = `${path.parse(filename).name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`;
  const output = path.join(outputDirectory, outputName);
  const result = spawnSync(ffmpeg, [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', source,
    '-vf', "scale=w='min(2048,iw)':h=-2", '-frames:v', '1',
    '-q:v', '3', '-pix_fmt', 'yuvj420p', output,
  ], { encoding: 'utf8', windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(result.stderr || String(result.error));
  manifest[`/HACIENDA F22/360/${filename}`] = `/panoramas/mobile/hacienda-f22/${outputName}`;
  originalBytes += (await stat(source)).size;
  mobileBytes += (await stat(output)).size;
}
if (!Object.keys(manifest).length) throw new Error('No se encontraron panoramas F22.');
await writeFile(path.join(root, 'src/config/mobilePanoramas.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ images: Object.keys(manifest).length, originalBytes, mobileBytes }));
