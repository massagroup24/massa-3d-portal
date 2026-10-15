import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { encryptBuffer, sha256 } from './lib/crypto.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Cargar archivo local de configuración
const envPath = path.join(ROOT_DIR, '.env.backup.local');
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nsiglkllgsgilwmdxkuu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BACKUP_DIR = path.resolve(ROOT_DIR, process.env.BACKUP_DIR || '../massa-backups');
const BACKUP_PASSPHRASE = process.env.BACKUP_PASSPHRASE;

function printUsageAndExit(missingVar) {
  console.error('\n❌ ERROR: Falta configurar variables requeridas en .env.backup.local');
  console.error(`Variable faltante o vacía: ${missingVar}\n`);
  console.error('Crea o edita el archivo .env.backup.local con la siguiente estructura:');
  console.error('---------------------------------------------------------------------');
  console.error('SUPABASE_DB_URL=postgresql://postgres:[TU-PASSWORD]@db.nsiglkllgsgilwmdxkuu.supabase.co:5432/postgres');
  console.error('SUPABASE_URL=https://nsiglkllgsgilwmdxkuu.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=[TU-SERVICE-ROLE-KEY]');
  console.error('BACKUP_DIR=../massa-backups');
  console.error('BACKUP_PASSPHRASE=[PASSPHRASE-DE-AL-MENOS-8-CARACTERES]');
  console.error('---------------------------------------------------------------------\n');
  process.exit(1);
}

if (!SUPABASE_DB_URL) printUsageAndExit('SUPABASE_DB_URL');
if (!SUPABASE_SERVICE_ROLE_KEY) printUsageAndExit('SUPABASE_SERVICE_ROLE_KEY');
if (!BACKUP_PASSPHRASE || BACKUP_PASSPHRASE.length < 8) printUsageAndExit('BACKUP_PASSPHRASE (mínimo 8 caracteres)');

/**
 * Descarga recursiva de objetos de un bucket de Supabase Storage mediante Service Role Key
 */
async function downloadBucketFiles(bucketName) {
  const serviceHeaders = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  const files = [];

  async function listRecursive(prefix = '') {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucketName}`, {
      method: 'POST',
      headers: serviceHeaders,
      body: JSON.stringify({ prefix, limit: 100, sortBy: { column: 'name', order: 'asc' } })
    });

    if (!res.ok) {
      const errText = await res.text();
      // Si el bucket no existe o está vacío
      if (res.status === 404 || errText.includes('Bucket not found')) {
        return;
      }
      throw new Error(`Error listando bucket '${bucketName}': ${res.status} ${errText}`);
    }

    const items = await res.json();
    if (!Array.isArray(items)) return;

    for (const item of items) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null && !item.metadata) {
        // Es una subcarpeta virtual
        await listRecursive(fullPath);
      } else {
        // Es un archivo concreto
        files.push(fullPath);
      }
    }
  }

  await listRecursive('');

  const downloadedFiles = [];
  let totalBytes = 0;

  for (const filePath of files) {
    const downloadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/${bucketName}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, {
      headers: serviceHeaders
    });

    if (!downloadRes.ok) {
      // Reintentar en endpoint alternativo
      const altRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucketName}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, {
        headers: serviceHeaders
      });
      if (!altRes.ok) {
        throw new Error(`No se pudo descargar archivo '${filePath}' de '${bucketName}': ${downloadRes.status}`);
      }
      const buffer = Buffer.from(await altRes.arrayBuffer());
      const hash = sha256(buffer);
      totalBytes += buffer.length;
      downloadedFiles.push({
        path: filePath,
        size: buffer.length,
        sha256: hash,
        dataBase64: buffer.toString('base64')
      });
    } else {
      const buffer = Buffer.from(await downloadRes.arrayBuffer());
      const hash = sha256(buffer);
      totalBytes += buffer.length;
      downloadedFiles.push({
        path: filePath,
        size: buffer.length,
        sha256: hash,
        dataBase64: buffer.toString('base64')
      });
    }
  }

  return {
    bucket: bucketName,
    filesCount: downloadedFiles.length,
    totalBytes,
    files: downloadedFiles
  };
}

/**
 * Dump de Base de Datos vía conexión directa PostgreSQL
 */
async function dumpDatabase() {
  const client = new pg.Client({
    connectionString: SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    // 1. Obtener lista de tablas en public
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map(r => r.table_name);
    const databaseDump = {
      tables: {},
      policies: [],
      schemaInfo: {}
    };

    // 2. Extraer datos y conteos de cada tabla
    for (const t of tableNames) {
      const rowsRes = await client.query(`SELECT * FROM public."${t}"`);
      databaseDump.tables[t] = {
        rowCount: rowsRes.rows.length,
        columns: rowsRes.fields.map(f => f.name),
        rows: rowsRes.rows
      };
    }

    // 3. Extraer políticas existentes de pg_policies
    try {
      const polRes = await client.query(`
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;
      `);
      databaseDump.policies = polRes.rows;
    } catch (e) {
      databaseDump.policiesError = e.message;
    }

    // 4. Extraer definiciones de vistas públicas
    try {
      const viewsRes = await client.query(`
        SELECT table_name, view_definition
        FROM information_schema.views
        WHERE table_schema = 'public';
      `);
      databaseDump.views = viewsRes.rows;
    } catch (e) {
      databaseDump.viewsError = e.message;
    }

    return databaseDump;
  } finally {
    await client.end();
  }
}

/**
 * Rotación de respaldos: Diarios 7 días, Semanales 4 semanas, Mensuales 6 meses
 */
function rotateBackups(backupDirectory) {
  if (!fs.existsSync(backupDirectory)) return [];

  const files = fs.readdirSync(backupDirectory)
    .filter(f => f.startsWith('massa-backup-') && f.endsWith('.tar.gz.enc'))
    .map(f => {
      const fullPath = path.join(backupDirectory, f);
      const stat = fs.statSync(fullPath);
      return { name: f, path: fullPath, mtime: stat.mtime };
    })
    .sort((a, b) => b.mtime - a.mtime); // Más recientes primero

  const now = new Date();
  const kept = new Set();
  const deleted = [];

  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDaysAgo = new Date(now.getTime() - 7 * oneDay);
  const fourWeeksAgo = new Date(now.getTime() - 28 * oneDay);
  const sixMonthsAgo = new Date(now.getTime() - 180 * oneDay);

  const weeklyBuckets = new Set();
  const monthlyBuckets = new Set();

  for (const item of files) {
    const fileTime = item.mtime;

    // Regla 1: Conservar todos los respaldos diarios de los últimos 7 días
    if (fileTime >= sevenDaysAgo) {
      kept.add(item.name);
      continue;
    }

    // Regla 2: Semanales (1 por semana durante 4 semanas)
    if (fileTime >= fourWeeksAgo) {
      const weekKey = `${fileTime.getFullYear()}-W${Math.ceil((fileTime.getDate() + 6) / 7)}`;
      if (!weeklyBuckets.has(weekKey)) {
        weeklyBuckets.add(weekKey);
        kept.add(item.name);
        continue;
      }
    }

    // Regla 3: Mensuales (1 por mes durante 6 meses)
    if (fileTime >= sixMonthsAgo) {
      const monthKey = `${fileTime.getFullYear()}-${fileTime.getMonth() + 1}`;
      if (!monthlyBuckets.has(monthKey)) {
        monthlyBuckets.add(monthKey);
        kept.add(item.name);
        continue;
      }
    }

    // Si supera los 6 meses o es redundante, se elimina de acuerdo a la rotación
    try {
      fs.unlinkSync(item.path);
      deleted.push(item.name);
    } catch (e) {
      console.warn(`No se pudo eliminar archivo antiguo ${item.name}: ${e.message}`);
    }
  }

  return { kept: Array.from(kept), deleted };
}

async function main() {
  console.log('===========================================================');
  console.log('   MASSA VIEW — SISTEMA DE RESPALDO INTEGRAL Y CIFRADO    ');
  console.log('===========================================================');
  const startTime = Date.now();

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  console.log(`\n[1/4] Conectando a Base de Datos (conexión directa PostgreSQL)...`);
  const databaseData = await dumpDatabase();
  const tableCounts = {};
  for (const [t, info] of Object.entries(databaseData.tables)) {
    tableCounts[t] = info.rowCount;
  }
  console.log(`      ✓ Tablas volcadas: ${Object.keys(tableCounts).length}`);
  for (const [t, c] of Object.entries(tableCounts)) {
    console.log(`        - ${t.padEnd(20)}: ${c} registros`);
  }

  console.log(`\n[2/4] Descargando almacenamiento (Storage API con Service Role)...`);
  const tourImagesBackup = await downloadBucketFiles('tour-images');
  console.log(`      ✓ Bucket 'tour-images': ${tourImagesBackup.filesCount} archivos (${(tourImagesBackup.totalBytes / 1024).toFixed(1)} KB)`);

  const projectVaultBackup = await downloadBucketFiles('project-vault');
  console.log(`      ✓ Bucket 'project-vault': ${projectVaultBackup.filesCount} archivos (${(projectVaultBackup.totalBytes / 1024).toFixed(1)} KB)`);

  // Construir Manifiesto y Paquete Cifrado
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const bundle = {
    version: '2.0',
    createdAt: new Date().toISOString(),
    manifest: {
      tableCounts,
      storage: {
        'tour-images': {
          count: tourImagesBackup.filesCount,
          totalBytes: tourImagesBackup.totalBytes,
          files: tourImagesBackup.files.map(f => ({ path: f.path, size: f.size, sha256: f.sha256 }))
        },
        'project-vault': {
          count: projectVaultBackup.filesCount,
          totalBytes: projectVaultBackup.totalBytes,
          files: projectVaultBackup.files.map(f => ({ path: f.path, size: f.size, sha256: f.sha256 }))
        }
      }
    },
    database: databaseData,
    storage: {
      'tour-images': tourImagesBackup.files,
      'project-vault': projectVaultBackup.files
    }
  };

  console.log(`\n[3/4] Cifrando paquete con AES-256-GCM y compresión gzip...`);
  const rawBuffer = Buffer.from(JSON.stringify(bundle), 'utf-8');
  const encryptedBuffer = encryptBuffer(rawBuffer, BACKUP_PASSPHRASE);

  const backupFilename = `massa-backup-${timestamp}.tar.gz.enc`;
  const backupFilePath = path.join(BACKUP_DIR, backupFilename);
  fs.writeFileSync(backupFilePath, encryptedBuffer);

  const sizeKb = (encryptedBuffer.length / 1024).toFixed(2);
  console.log(`      ✓ Respaldo guardado exitosamente:`);
  console.log(`        Ruta:   ${backupFilePath}`);
  console.log(`        Tamaño: ${sizeKb} KB (cifrado en reposo)`);

  console.log(`\n[4/4] Ejecutando rotación automática de respaldos...`);
  const rotationResult = rotateBackups(BACKUP_DIR);
  console.log(`      ✓ Respaldos conservados: ${rotationResult.kept.length}`);
  if (rotationResult.deleted.length > 0) {
    console.log(`      ✓ Respaldos rotados (depurados): ${rotationResult.deleted.length}`);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n===========================================================');
  console.log(`✅ RESPALDO COMPLETADO EXITOSAMENTE EN ${durationSec}s`);
  console.log('===========================================================\n');
}

main().catch(err => {
  console.error('\n❌ ERROR EN EL PROCESO DE RESPALDO:', err.message);
  process.exit(1);
});
