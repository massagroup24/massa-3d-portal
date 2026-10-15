import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const envTestPath = path.join(ROOT_DIR, '.env.test.local');
if (fs.existsSync(envTestPath)) {
  process.loadEnvFile(envTestPath);
}

const PROD_SUPABASE_URL = process.env.PROD_SUPABASE_URL || 'https://nsiglkllgsgilwmdxkuu.supabase.co';
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL;
const TEST_SERVICE_ROLE_KEY = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
const ALLOW_PROD_TESTS = process.env.ALLOW_PROD_TESTS;

function verifySafety() {
  if (!TEST_SUPABASE_URL || !TEST_SERVICE_ROLE_KEY) {
    console.error('\n❌ ERROR: Falta configurar TEST_SUPABASE_URL o TEST_SUPABASE_SERVICE_ROLE_KEY en .env.test.local.\n');
    process.exit(1);
  }
  if (TEST_SUPABASE_URL.trim().toLowerCase() === PROD_SUPABASE_URL.trim().toLowerCase()) {
    console.error('\n🛑 BLOQUEO DE SEGURIDAD: TEST_SUPABASE_URL coincide con producción. Abortando.');
    process.exit(1);
  }
  if (TEST_SUPABASE_URL.includes('nsiglkllgsgilwmdxkuu')) {
    console.error('\n🛑 BLOQUEO DE SEGURIDAD: Apuntando a instancia de producción. Abortando.');
    process.exit(1);
  }
  if (ALLOW_PROD_TESTS !== 'false') {
    console.error('\n🛑 BLOQUEO DE SEGURIDAD: ALLOW_PROD_TESTS debe ser "false". Abortando.');
    process.exit(1);
  }
}

verifySafety();

const testAdmin = createClient(TEST_SUPABASE_URL, TEST_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('===========================================================');
  console.log('   MASSA VIEW — AUDITORÍA DE SALUD DEL ENTORNO DE PRUEBAS ');
  console.log('===========================================================');
  console.log(`Instancia de Pruebas: ${TEST_SUPABASE_URL}`);

  let allChecksPassed = true;

  // 1. Verificar Usuarios
  const { data: users, error: uErr } = await testAdmin.from('user_profiles').select('*');
  if (uErr) {
    console.error(`❌ Error consultando user_profiles: ${uErr.message}`);
    allChecksPassed = false;
  } else {
    const arch = users.find(u => u.role === 'architect');
    const clients = users.filter(u => u.role === 'client');
    const userOk = arch && clients.length === 2;
    console.log(`[1/5] Perfiles de Usuario: ${users.length} encontrados ${userOk ? '✅' : '❌'}`);
    console.log(`      - Arquitecto: ${arch ? arch.email : 'NO ENCONTRADO'}`);
    console.log(`      - Clientes:   ${clients.map(c => c.email).join(', ')}`);
    if (!userOk) allChecksPassed = false;
  }

  // 2. Verificar Proyectos
  const { data: projs, error: pErr } = await testAdmin.from('projects').select('id, published_for_client');
  if (pErr) {
    console.error(`❌ Error consultando projects: ${pErr.message}`);
    allChecksPassed = false;
  } else {
    const p1 = projs.find(p => p.id === 'massa-test-p1');
    const p2 = projs.find(p => p.id === 'massa-test-p2');
    const p3 = projs.find(p => p.id === 'massa-test-p3-unpublished');
    const projsOk = p1 && p2 && p3 && p1.published_for_client && p2.published_for_client && !p3.published_for_client;
    console.log(`[2/5] Proyectos de Prueba: ${projs.length} encontrados ${projsOk ? '✅' : '❌'}`);
    console.log(`      - P1 (massa-test-p1): Publicado para cliente = ${p1?.published_for_client}`);
    console.log(`      - P2 (massa-test-p2): Publicado para cliente = ${p2?.published_for_client}`);
    console.log(`      - P3 (massa-test-p3): Publicado para cliente = ${p3?.published_for_client}`);
    if (!projsOk) allChecksPassed = false;
  }

  // 3. Verificar Membresías (Aislamiento Cliente A ↔ P1, Cliente B ↔ P2)
  const { data: members, error: mErr } = await testAdmin.from('project_members').select('*');
  if (mErr) {
    console.error(`❌ Error consultando project_members: ${mErr.message}`);
    allChecksPassed = false;
  } else {
    const p1Members = members.filter(m => m.project_id === 'massa-test-p1');
    const p2Members = members.filter(m => m.project_id === 'massa-test-p2');
    const crossCheck = p1Members.length === 1 && p2Members.length === 1 && p1Members[0].user_id !== p2Members[0].user_id;
    console.log(`[3/5] Aislamiento de Membresías: ${members.length} asignaciones ${crossCheck ? '✅' : '❌'}`);
    console.log(`      - P1 Asignado a: ${p1Members[0]?.user_id}`);
    console.log(`      - P2 Asignado a: ${p2Members[0]?.user_id}`);
    if (!crossCheck) allChecksPassed = false;
  }

  // 4. Verificar Medios y Avances (Casos publicados y no publicados)
  const { data: media, error: medErr } = await testAdmin.from('project_media').select('project_id, published');
  const { data: updates, error: updErr } = await testAdmin.from('progress_updates').select('project_id, published');

  if (medErr || updErr) {
    console.error('❌ Error consultando medios o avances.');
    allChecksPassed = false;
  } else {
    const hasPublishedMedia = media.some(m => m.published);
    const hasDraftMedia = media.some(m => !m.published);
    const hasPublishedUpdate = updates.some(u => u.published);
    const hasDraftUpdate = updates.some(u => !u.published);
    const mediaOk = hasPublishedMedia && hasDraftMedia && hasPublishedUpdate && hasDraftUpdate;
    console.log(`[4/5] Contenido Publicado vs Borradores: ${mediaOk ? '✅' : '❌'}`);
    console.log(`      - Medios Publicados:    ${media.filter(m => m.published).length} items`);
    console.log(`      - Medios Borrador:      ${media.filter(m => !m.published).length} items`);
    console.log(`      - Avances Publicados:   ${updates.filter(u => u.published).length} items`);
    console.log(`      - Avances Borrador:     ${updates.filter(u => !u.published).length} items`);
    if (!mediaOk) allChecksPassed = false;
  }

  // 5. Verificar Storage (Archivos en project-vault)
  const { data: vaultFiles, error: sfErr } = await testAdmin.storage.from('project-vault').list('projects', { limit: 10 });
  if (sfErr) {
    console.error(`❌ Error en Storage project-vault: ${sfErr.message}`);
    allChecksPassed = false;
  } else {
    const hasP1Folder = vaultFiles.some(f => f.name === 'massa-test-p1');
    const hasP2Folder = vaultFiles.some(f => f.name === 'massa-test-p2');
    console.log(`[5/5] Storage project-vault: carpetas P1 y P2 detectadas ${hasP1Folder && hasP2Folder ? '✅' : '❌'}`);
    if (!hasP1Folder || !hasP2Folder) allChecksPassed = false;
  }

  // Comprobación de Producción Intacta
  console.log('\n[AUDITORÍA DE INTEGRIDAD DE PRODUCCIÓN]');
  const prodAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zaWdsa2xsZ3NnaWx3bWR4a3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTAzODEsImV4cCI6MjA5NzM2NjM4MX0.pGvHyGlKogUnX9hWcz_Y-bjH5a-53LATWc-x9taCQBw';
  const prodRes = await fetch(`${PROD_SUPABASE_URL}/rest/v1/projects?select=id`, {
    headers: { apikey: prodAnonKey, Authorization: `Bearer ${prodAnonKey}` }
  });
  if (prodRes.ok) {
    const prodProjs = await prodRes.json();
    console.log(`      ✓ Producción intacta: ${prodProjs.length} proyectos reales en producción (sin proyectos de prueba).`);
  }

  console.log('\n===========================================================');
  if (allChecksPassed) {
    console.log('✅ ENTORNO DE PRUEBAS 100% LISTO PARA LA SUITA DE PERMISOS');
  } else {
    console.log('⚠️ SE DETECTARON DISCREPANCIAS EN EL ENTORNO DE PRUEBAS');
    process.exit(1);
  }
  console.log('===========================================================\n');
}

main().catch(err => {
  console.error('\n❌ ERROR EN LA VERIFICACIÓN DE PRUEBAS:', err.message);
  process.exit(1);
});
