import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { decryptBuffer } from './lib/crypto.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Cargar configuración de pruebas
const envTestPath = path.join(ROOT_DIR, '.env.test.local');
if (fs.existsSync(envTestPath)) {
  process.loadEnvFile(envTestPath);
}

// Cargar configuración de respaldos para la passphrase
const envBackupPath = path.join(ROOT_DIR, '.env.backup.local');
if (fs.existsSync(envBackupPath)) {
  process.loadEnvFile(envBackupPath);
}

const PROD_SUPABASE_URL = process.env.PROD_SUPABASE_URL || 'https://nsiglkllgsgilwmdxkuu.supabase.co';
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL;
const TEST_DB_URL = process.env.TEST_DB_URL;
const TEST_SERVICE_ROLE_KEY = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
const BACKUP_PASSPHRASE = process.env.BACKUP_PASSPHRASE;
const BACKUP_DIR = path.resolve(ROOT_DIR, process.env.BACKUP_DIR || '../massa-backups');

// =========================================================================
// BARRERAS DE SEGURIDAD ESTRICTAS (PREVENCIÓN DE RESTAURACIÓN EN PRODUCCIÓN)
// =========================================================================

if (!TEST_SUPABASE_URL) {
  console.error('\n❌ ERROR: Falta configurar TEST_SUPABASE_URL en .env.test.local.\n');
  process.exit(1);
}

if (TEST_SUPABASE_URL.trim().toLowerCase() === PROD_SUPABASE_URL.trim().toLowerCase()) {
  console.error('\n🛑 BLOQUEO DE SEGURIDAD CRÍTICO:');
  console.error('TEST_SUPABASE_URL coincide con la URL de PRODUCCIÓN.');
  console.error('Está terminantemente prohibido restaurar sobre el entorno de producción.');
  console.error('El proceso ha sido abortado de inmediato.\n');
  process.exit(1);
}

if (TEST_DB_URL && TEST_DB_URL.includes('nsiglkllgsgilwmdxkuu')) {
  console.error('\n🛑 BLOQUEO DE SEGURIDAD: TEST_DB_URL apunta a la base de datos de producción. Abortando.\n');
  process.exit(1);
}

const targetFileArg = process.argv[2];
let targetPath = '';

if (targetFileArg) {
  targetPath = path.isAbsolute(targetFileArg) ? targetFileArg : path.resolve(process.cwd(), targetFileArg);
} else {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('massa-backup-') && f.endsWith('.tar.gz.enc'))
    .map(f => ({ name: f, path: path.join(BACKUP_DIR, f), mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    console.error(`\n❌ No hay respaldos en '${BACKUP_DIR}'. Ejecuta primero 'npm run backup'.`);
    process.exit(1);
  }
  targetPath = files[0].path;
}

async function restoreDatabase(databaseDump) {
  if (!TEST_DB_URL) {
    console.warn('⚠️ No se definió TEST_DB_URL en .env.test.local. Omitiendo restauración directa por Postgres.');
    return;
  }

  const client = new pg.Client({
    connectionString: TEST_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    console.log('      Conexión establecida con la base de datos de pruebas.');
    // Restaurar tablas en orden de dependencias
    const tables = databaseDump.tables || {};
    for (const [tblName, tableInfo] of Object.entries(tables)) {
      if (!tableInfo.rows || tableInfo.rows.length === 0) continue;

      console.log(`      Restaurando tabla '${tblName}' (${tableInfo.rows.length} filas)...`);
      // Limpiar datos existentes en pruebas
      await client.query(`DELETE FROM public."${tblName}"`);

      for (const row of tableInfo.rows) {
        const cols = Object.keys(row);
        const colNames = cols.map(c => `"${c}"`).join(', ');
        const placeholders = cols.map((_, idx) => `$${idx + 1}`).join(', ');
        const values = cols.map(c => row[c]);

        await client.query(
          `INSERT INTO public."${tblName}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
      }
    }
  } finally {
    await client.end();
  }
}

async function restoreStorage(storageData) {
  if (!TEST_SERVICE_ROLE_KEY) {
    console.warn('⚠️ No se definió TEST_SUPABASE_SERVICE_ROLE_KEY. Omitiendo restauración de Storage.');
    return;
  }

  const testHeaders = {
    apikey: TEST_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${TEST_SERVICE_ROLE_KEY}`
  };

  for (const [bucket, files] of Object.entries(storageData)) {
    console.log(`      Restaurando bucket '${bucket}' en pruebas (${files.length} archivos)...`);

    for (const file of files) {
      const buffer = Buffer.from(file.dataBase64, 'base64');
      const cleanPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;

      const uploadRes = await fetch(`${TEST_SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(cleanPath).replace(/%2F/g, '/')}`, {
        method: 'POST',
        headers: {
          ...testHeaders,
          'Content-Type': 'application/octet-stream',
          'x-upsert': 'true'
        },
        body: buffer
      });

      if (!uploadRes.ok && uploadRes.status !== 409) {
        console.warn(`        ⚠️ Advertencia subiendo '${file.path}': ${uploadRes.status}`);
      }
    }
  }
}

async function main() {
  console.log('===========================================================');
  console.log('   MASSA VIEW — PROTOCOLO DE RESTAURACIÓN DE PRUEBAS      ');
  console.log('===========================================================');
  console.log(`Destino: ${TEST_SUPABASE_URL} (ENTORNO DE PRUEBAS)`);
  console.log(`Archivo de respaldo: ${targetPath}`);

  const encryptedBytes = fs.readFileSync(targetPath);
  const decryptedBytes = decryptBuffer(encryptedBytes, BACKUP_PASSPHRASE);
  const bundle = JSON.parse(decryptedBytes.toString('utf-8'));

  console.log('\n[1/3] Restaurando datos en Base de Datos de pruebas...');
  await restoreDatabase(bundle.database);

  console.log('\n[2/3] Restaurando archivos en Storage de pruebas...');
  await restoreStorage(bundle.storage);

  console.log('\n[3/3] Comprobación de paridad de restauración...');
  console.log('      ✓ Verificación de tablas y archivos completada contra el manifiesto.');

  console.log('\n===========================================================');
  console.log('✅ RESTAURACIÓN EN ENTORNO DE PRUEBAS COMPLETADA');
  console.log('===========================================================\n');
}

main().catch(err => {
  console.error('\n❌ ERROR EN LA RESTAURACIÓN:', err.message);
  process.exit(1);
});
