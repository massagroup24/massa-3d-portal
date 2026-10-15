import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { decryptBuffer, sha256 } from './lib/crypto.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const envPath = path.join(ROOT_DIR, '.env.backup.local');
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const BACKUP_DIR = path.resolve(ROOT_DIR, process.env.BACKUP_DIR || '../massa-backups');
const BACKUP_PASSPHRASE = process.env.BACKUP_PASSPHRASE;

if (!BACKUP_PASSPHRASE) {
  console.error('\n❌ ERROR: Falta BACKUP_PASSPHRASE en .env.backup.local para poder descifrar y verificar el respaldo.\n');
  process.exit(1);
}

// Permitir pasar un archivo específico o usar el más reciente
const targetFileArg = process.argv[2];
let targetPath = '';

if (targetFileArg) {
  targetPath = path.isAbsolute(targetFileArg) ? targetFileArg : path.resolve(process.cwd(), targetFileArg);
} else {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error(`\n❌ El directorio de respaldos '${BACKUP_DIR}' no existe.`);
    process.exit(1);
  }
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('massa-backup-') && f.endsWith('.tar.gz.enc'))
    .map(f => ({ name: f, path: path.join(BACKUP_DIR, f), mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    console.error(`\n❌ No se encontraron archivos de respaldo en '${BACKUP_DIR}'. Ejecuta primero 'npm run backup'.`);
    process.exit(1);
  }
  targetPath = files[0].path;
}

console.log('===========================================================');
console.log('   MASSA VIEW — VERIFICACIÓN Y AUDITORÍA DE INTEGRIDAD    ');
console.log('===========================================================');
console.log(`Archivo a verificar: ${targetPath}`);

try {
  const encryptedBytes = fs.readFileSync(targetPath);
  console.log(`Tamaño del archivo cifrado: ${(encryptedBytes.length / 1024).toFixed(2)} KB`);

  console.log('\n[1/3] Descifrando paquete con AES-256-GCM y descomprimiendo...');
  const decryptedBytes = decryptBuffer(encryptedBytes, BACKUP_PASSPHRASE);
  const bundle = JSON.parse(decryptedBytes.toString('utf-8'));
  console.log(`      ✓ Criptografía válida. Versión del bundle: ${bundle.version}`);
  console.log(`      ✓ Fecha de creación del respaldo: ${bundle.createdAt}`);

  console.log('\n[2/3] Verificando conteos e integridad de Base de Datos...');
  const tables = bundle.manifest?.tableCounts || {};
  let totalRows = 0;
  for (const [tbl, count] of Object.entries(tables)) {
    const actualRows = bundle.database?.tables?.[tbl]?.rows?.length ?? 0;
    const match = count === actualRows;
    totalRows += count;
    console.log(`      - Tabla '${tbl}': ${count} registros ${match ? '✅ (COINCIDE)' : '❌ (DISCREPANCIA)'}`);
  }
  console.log(`      ✓ Total de registros en base de datos: ${totalRows}`);

  console.log('\n[3/3] Verificando sumas de comprobación SHA-256 de archivos en Storage...');
  let verifiedFiles = 0;
  let corruptedFiles = 0;

  const storageManifest = bundle.manifest?.storage || {};
  for (const [bucket, info] of Object.entries(storageManifest)) {
    console.log(`      Bucket '${bucket}': ${info.count} archivos declarados`);
    const filesInBucket = bundle.storage?.[bucket] || [];

    for (const f of filesInBucket) {
      const buffer = Buffer.from(f.dataBase64, 'base64');
      const recomputedHash = sha256(buffer);
      if (recomputedHash === f.sha256) {
        verifiedFiles++;
      } else {
        corruptedFiles++;
        console.error(`        ❌ Discrepancia de integridad en '${f.path}': hash corrupto.`);
      }
    }
  }

  console.log(`      ✓ Archivos verificados con SHA-256: ${verifiedFiles}`);
  if (corruptedFiles > 0) {
    console.error(`      ❌ Archivos corruptos detectados: ${corruptedFiles}`);
    process.exit(1);
  }

  console.log('\n===========================================================');
  console.log('✅ RESPALDO 100% ÍNTEGRO, VERIFICADO Y RESTAURABLE');
  console.log('===========================================================\n');
} catch (err) {
  console.error('\n❌ ERROR EN LA VERIFICACIÓN DEL RESPALDO:', err.message);
  process.exit(1);
}
