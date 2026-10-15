import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Cargar archivo local de entorno de pruebas
const envTestPath = path.join(ROOT_DIR, '.env.test.local');
if (fs.existsSync(envTestPath)) {
  process.loadEnvFile(envTestPath);
}

const PROD_SUPABASE_URL = process.env.PROD_SUPABASE_URL || 'https://nsiglkllgsgilwmdxkuu.supabase.co';
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL;
const TEST_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY;
const TEST_SERVICE_ROLE_KEY = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
const ALLOW_PROD_TESTS = process.env.ALLOW_PROD_TESTS;

// =========================================================================
// BARRERAS DE SEGURIDAD CRÍTICAS (PREVENCIÓN DE SIEMBRA EN PRODUCCIÓN)
// =========================================================================

function checkSafetyGuards() {
  if (!TEST_SUPABASE_URL) {
    console.error('\n❌ ERROR: Falta configurar TEST_SUPABASE_URL en .env.test.local.\n');
    console.error('Crea el archivo .env.test.local con tus credenciales del proyecto de pruebas:');
    console.error('-------------------------------------------------------------------------');
    console.error('PROD_SUPABASE_URL=https://nsiglkllgsgilwmdxkuu.supabase.co');
    console.error('ALLOW_PROD_TESTS=false');
    console.error('TEST_SUPABASE_URL=https://[ID-PROYECTO-PRUEBAS].supabase.co');
    console.error('TEST_SUPABASE_ANON_KEY=[ANON-KEY-PRUEBAS]');
    console.error('TEST_SUPABASE_SERVICE_ROLE_KEY=[SERVICE-ROLE-KEY-PRUEBAS]');
    console.error('-------------------------------------------------------------------------\n');
    process.exit(1);
  }

  // 1. Comparación contra la URL conocida de producción
  if (TEST_SUPABASE_URL.trim().toLowerCase() === PROD_SUPABASE_URL.trim().toLowerCase()) {
    console.error('\n🛑 BLOQUEO DE SEGURIDAD: TEST_SUPABASE_URL coincide con PRODUCCIÓN.');
    console.error('La siembra de datos de prueba está terminantemente prohibida en producción.');
    process.exit(1);
  }

  // 2. Detección de subcadena del ID de proyecto de producción
  if (TEST_SUPABASE_URL.includes('nsiglkllgsgilwmdxkuu')) {
    console.error('\n🛑 BLOQUEO DE SEGURIDAD: El dominio contiene el ID del proyecto de producción (nsiglkllgsgilwmdxkuu). Abortando.');
    process.exit(1);
  }

  // 3. Verificación de bandera de aislamiento
  if (ALLOW_PROD_TESTS !== 'false') {
    console.error('\n🛑 BLOQUEO DE SEGURIDAD: ALLOW_PROD_TESTS debe ser estrictamente "false". Abortando.');
    process.exit(1);
  }

  if (!TEST_SERVICE_ROLE_KEY) {
    console.error('\n❌ ERROR: Se requiere TEST_SUPABASE_SERVICE_ROLE_KEY para la siembra administrativa del entorno de pruebas.');
    process.exit(1);
  }
}

checkSafetyGuards();

const adminClient = createClient(TEST_SUPABASE_URL, TEST_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// =========================================================================
// DEFINICIÓN DE IDENTIDADES Y CREDENCIALES DE PRUEBA
// =========================================================================

const TEST_USERS = [
  {
    key: 'arquitecto',
    email: 'test_arquitecto@massagroup.test',
    password: process.env.TEST_ARCHITECT_PASSWORD || 'MassaArch2026!#Secure',
    name: 'Arq. Mateo Rossi (Arquitecto Director)',
    role: 'architect',
    phone: '+57 310 892 4410'
  },
  {
    key: 'cliente_a',
    email: 'test_cliente_a@massagroup.test',
    password: process.env.TEST_CLIENT_A_PASSWORD || 'MassaClientA2026!#',
    name: 'Carlos Mendoza (Propietario P1)',
    role: 'client',
    phone: '+57 300 123 4567'
  },
  {
    key: 'cliente_b',
    email: 'test_cliente_b@massagroup.test',
    password: process.env.TEST_CLIENT_B_PASSWORD || 'MassaClientB2026!#',
    name: 'Marquimoda S.A.S. (Propietario P2)',
    role: 'client',
    phone: '+57 311 987 6543'
  }
];

// =========================================================================
// PROCESO DE SIEMBRA IDEMPOTENTE
// =========================================================================

async function seedUsers() {
  console.log('\n[1/5] Sembrando usuarios de prueba en Supabase Auth y user_profiles...');
  const userMap = {};

  // Obtener usuarios existentes en Auth para garantizar idempotencia
  const { data: existingUsersData, error: listErr } = await adminClient.auth.admin.listUsers();
  if (listErr) throw new Error(`Error listando auth.users: ${listErr.message}`);
  const existingUsers = existingUsersData?.users || [];

  for (const u of TEST_USERS) {
    let authUser = existingUsers.find(item => item.email?.toLowerCase() === u.email.toLowerCase());

    if (!authUser) {
      console.log(`      Creando usuario en Auth: ${u.email}`);
      const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name, role: u.role }
      });
      if (createErr) throw new Error(`Error creando ${u.email}: ${createErr.message}`);
      authUser = created.user;
    } else {
      console.log(`      Usuario ya existe en Auth: ${u.email} (actualizando contraseña)`);
      const { data: updated, error: updateErr } = await adminClient.auth.admin.updateUserById(authUser.id, {
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name, role: u.role }
      });
      if (updateErr) throw new Error(`Error actualizando ${u.email}: ${updateErr.message}`);
      authUser = updated.user;
    }

    userMap[u.key] = authUser.id;

    // Upsert en public.user_profiles
    const { error: profileErr } = await adminClient
      .from('user_profiles')
      .upsert({
        id: authUser.id,
        email: u.email,
        name: u.name,
        role: u.role,
        phone: u.phone,
        updated_at: new Date().toISOString()
      });

    if (profileErr) throw new Error(`Error guardando perfil para ${u.email}: ${profileErr.message}`);
  }

  return userMap;
}

async function seedProjects(userMap) {
  console.log('\n[2/5] Sembrando proyectos de prueba (P1, P2 y P3)...');

  // Proyecto P1: Asignado a cliente_a (Publicado)
  const p1 = {
    id: 'massa-test-p1',
    data: {
      id: 'massa-test-p1',
      name: 'MASSA TEST — PROYECTO A (VILLA SERENA)',
      description: 'Residencia unifamiliar contemporánea en ladera de montaña.',
      initialRoomId: 'room-1',
      rooms: {
        'room-1': {
          id: 'room-1',
          name: 'Acceso Principal & Atrio',
          panoramaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',
          hotspots: [{ targetRoomId: 'room-2', label: 'Hacia Sala Principal', pitch: -5, yaw: 40 }]
        },
        'room-2': {
          id: 'room-2',
          name: 'Sala Doble Altura',
          panoramaUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85',
          hotspots: [{ targetRoomId: 'room-1', label: 'Volver a Entrada', pitch: 0, yaw: -140 }]
        }
      }
    },
    current_phase: 'FASE 3: ACABADOS DE LUJO',
    current_progress: 68,
    architect_name: 'Arq. Mateo Rossi',
    architect_role: 'Director de Proyecto MASSA',
    architect_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    architect_phone: '+57 310 892 4410',
    architect_whatsapp: '573108924410',
    published_for_client: true
  };

  // Proyecto P2: Asignado a cliente_b (Publicado)
  const p2 = {
    id: 'massa-test-p2',
    data: {
      id: 'massa-test-p2',
      name: 'MASSA TEST — PROYECTO B (SEDE CORPORATIVA MARQUIMODA)',
      description: 'Complejo empresarial bioclimático con plantas abiertas y atrio central.',
      initialRoomId: 'room-b1',
      rooms: {
        'room-b1': {
          id: 'room-b1',
          name: 'Lobby Corporativo',
          panoramaUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85',
          hotspots: []
        }
      }
    },
    current_phase: 'FASE 4: HABILITACIÓN ARQUITECTÓNICA',
    current_progress: 82,
    architect_name: 'Arq. Mateo Rossi',
    architect_role: 'Director de Proyecto MASSA',
    architect_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    architect_phone: '+57 310 892 4410',
    architect_whatsapp: '573108924410',
    published_for_client: true
  };

  // Proyecto P3: Caso de control no publicado
  const p3 = {
    id: 'massa-test-p3-unpublished',
    data: {
      id: 'massa-test-p3-unpublished',
      name: 'MASSA TEST — PROYECTO C (BORRADOR NO PUBLICADO)',
      description: 'Proyecto en formulación preliminar.',
      initialRoomId: 'room-c1',
      rooms: {}
    },
    current_phase: 'FASE 1: ANTEPROYECTO',
    current_progress: 15,
    architect_name: 'Arq. Mateo Rossi',
    architect_role: 'Director de Proyecto MASSA',
    architect_avatar: null,
    architect_phone: '+57 310 892 4410',
    architect_whatsapp: '573108924410',
    published_for_client: false // DESPUBLICADO PARA EL CLIENTE
  };

  for (const proj of [p1, p2, p3]) {
    const { error: pErr } = await adminClient.from('projects').upsert(proj);
    if (pErr) throw new Error(`Error guardando proyecto ${proj.id}: ${pErr.message}`);
    console.log(`      ✓ Proyecto creado/actualizado: ${proj.id}`);
  }
}

async function seedMembers(userMap) {
  console.log('\n[3/5] Asignando membresías estrictas (Clientes ↔ Proyectos)...');

  // Limpiar membresías previas de prueba para idempotencia limpia
  await adminClient.from('project_members').delete().in('project_id', ['massa-test-p1', 'massa-test-p2', 'massa-test-p3-unpublished']);

  const assignments = [
    { project_id: 'massa-test-p1', user_id: userMap['cliente_a'] },
    { project_id: 'massa-test-p2', user_id: userMap['cliente_b'] },
    { project_id: 'massa-test-p3-unpublished', user_id: userMap['cliente_a'] }
  ];

  for (const a of assignments) {
    const { error } = await adminClient.from('project_members').insert(a);
    if (error) throw new Error(`Error en asignación ${a.project_id} -> ${a.user_id}: ${error.message}`);
    console.log(`      ✓ Miembro asignado: ${a.project_id} ➔ ${a.user_id}`);
  }
}

async function seedMediaAndUpdates(userMap) {
  console.log('\n[4/5] Sembrando contenido publicado y no publicado (Medios y Avances)...');

  // 1. Limpieza de pruebas previas
  await adminClient.from('project_media').delete().in('project_id', ['massa-test-p1', 'massa-test-p2']);
  await adminClient.from('progress_updates').delete().in('project_id', ['massa-test-p1', 'massa-test-p2']);

  // 2. Medios de P1
  const mediaItems = [
    // P1: Render Publicado
    {
      id: '88888888-0001-4000-8000-000000000001',
      project_id: 'massa-test-p1',
      type: 'render',
      title: 'Render Fachada Principal (Publicado)',
      storage_path: 'projects/massa-test-p1/renders/fachada.jpg',
      category: 'Fachada',
      published: true,
      uploaded_by: userMap['arquitecto']
    },
    // P1: Render NO Publicado (Borrador interno del arquitecto)
    {
      id: '88888888-0001-4000-8000-000000000002',
      project_id: 'massa-test-p1',
      type: 'render',
      title: 'Render Estudio Volumétrico (Borrador No Publicado)',
      storage_path: 'projects/massa-test-p1/renders/borrador_volumen.jpg',
      category: 'Borradores',
      published: false, // NO DEBE SER VISTO POR CLIENTE A
      uploaded_by: userMap['arquitecto']
    },
    // P1: Plano Arquitectónico Publicado
    {
      id: '88888888-0001-4000-8000-000000000003',
      project_id: 'massa-test-p1',
      type: 'blueprint',
      title: 'Plano Planta General Nivel 1 (Publicado)',
      storage_path: 'projects/massa-test-p1/blueprints/planta_nivel1.pdf',
      category: 'Plantas',
      published: true,
      uploaded_by: userMap['arquitecto']
    },
    // P2: Render Publicado
    {
      id: '88888888-0002-4000-8000-000000000001',
      project_id: 'massa-test-p2',
      type: 'render',
      title: 'Render Corporativo Marquimoda (Publicado)',
      storage_path: 'projects/massa-test-p2/renders/acceso_corporativo.jpg',
      category: 'Fachada',
      published: true,
      uploaded_by: userMap['arquitecto']
    },
    // P2: Render NO Publicado
    {
      id: '88888888-0002-4000-8000-000000000002',
      project_id: 'massa-test-p2',
      type: 'render',
      title: 'Detalle de Fachada Flotante (Borrador Privado)',
      storage_path: 'projects/massa-test-p2/renders/detalle_privado.jpg',
      category: 'Detalles',
      published: false,
      uploaded_by: userMap['arquitecto']
    }
  ];

  for (const m of mediaItems) {
    const { error } = await adminClient.from('project_media').insert(m);
    if (error) throw new Error(`Error insertando project_media ${m.title}: ${error.message}`);
  }
  console.log(`      ✓ Insertados ${mediaItems.length} elementos de project_media (publicados y borradores).`);

  // 3. Avances de P1 y P2
  const updates = [
    // P1 Avance Publicado
    {
      id: '99999999-0001-4000-8000-000000000001',
      project_id: 'massa-test-p1',
      percentage: 68,
      phase_title: 'Hito 3: Estructura y Muros Concluidos (Publicado)',
      notes: 'Culminación exitosa de losas y muros portantes.',
      published: true
    },
    // P1 Avance NO Publicado (Observaciones de control de calidad interno)
    {
      id: '99999999-0001-4000-8000-000000000002',
      project_id: 'massa-test-p1',
      percentage: 70,
      phase_title: 'Revisión Técnica Interna de Fisuras (NO Publicado)',
      notes: 'Borrador interno arquitecto: requiere inspección de fraguado.',
      published: false // NO DEBE SER VISTO POR CLIENTE A
    },
    // P2 Avance Publicado
    {
      id: '99999999-0002-4000-8000-000000000001',
      project_id: 'massa-test-p2',
      percentage: 82,
      phase_title: 'Habilitación de Redes e Iluminación (Publicado)',
      notes: 'Instalación de luminarias y cielo raso acústico.',
      published: true
    }
  ];

  for (const u of updates) {
    const { error } = await adminClient.from('progress_updates').insert(u);
    if (error) throw new Error(`Error insertando progress_update: ${error.message}`);
  }
  console.log(`      ✓ Insertados ${updates.length} hitos de avance (publicados y no publicados).`);
}

async function seedStorageFiles() {
  console.log('\n[5/5] Sembrando archivos de prueba en project-vault...');

  const mockFiles = [
    {
      path: 'projects/massa-test-p1/renders/fachada.jpg',
      content: 'MOCK_BINARY_DATA: Render Fachada Villa Serena MASSA P1'
    },
    {
      path: 'projects/massa-test-p1/renders/borrador_volumen.jpg',
      content: 'MOCK_BINARY_DATA: Borrador Secreto No Publicado P1'
    },
    {
      path: 'projects/massa-test-p1/blueprints/planta_nivel1.pdf',
      content: 'MOCK_PDF_DATA: Plano Arquitectonico Nivel 1 P1'
    },
    {
      path: 'projects/massa-test-p2/renders/acceso_corporativo.jpg',
      content: 'MOCK_BINARY_DATA: Render Fachada Corporativa P2'
    },
    {
      path: 'projects/massa-test-p2/renders/detalle_privado.jpg',
      content: 'MOCK_BINARY_DATA: Detalle Privado No Publicado P2'
    }
  ];

  for (const f of mockFiles) {
    const buffer = Buffer.from(f.content, 'utf-8');
    const { error } = await adminClient.storage
      .from('project-vault')
      .upload(f.path, buffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (error) {
      console.warn(`      ⚠️ Advertencia subiendo a Storage ${f.path}: ${error.message}`);
    } else {
      console.log(`      ✓ Archivo sembrado en Storage: ${f.path}`);
    }
  }
}

async function main() {
  console.log('===========================================================');
  console.log('   MASSA VIEW — SCRIPT DE SIEMBRA DE ENTORNO DE PRUEBAS   ');
  console.log('===========================================================');
  console.log(`Destino Autorizado: ${TEST_SUPABASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const startTime = Date.now();
  const userMap = await seedUsers();
  await seedProjects(userMap);
  await seedMembers(userMap);
  await seedMediaAndUpdates(userMap);
  await seedStorageFiles();

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n===========================================================');
  console.log(`✅ SIEMBRA DE DATOS IDEMPOTENTE FINALIZADA EN ${durationSec}s`);
  console.log('===========================================================');
  console.log('Resumen de Datos de Prueba Creados:');
  console.log('  • Usuarios Auth: 3 creados/actualizados (1 arquitecto, 2 clientes)');
  console.log('  • Proyectos:     3 (P1 asignado a Cliente A, P2 a Cliente B, P3 despublicado)');
  console.log('  • Contenido:     Renders, planos y avances (publicados y borradores)');
  console.log('  • Storage:       Archivos sembrados en project-vault');
  console.log('===========================================================\n');
}

main().catch(err => {
  console.error('\n❌ ERROR EN LA SIEMBRA DE PRUEBAS:', err.message);
  process.exit(1);
});
