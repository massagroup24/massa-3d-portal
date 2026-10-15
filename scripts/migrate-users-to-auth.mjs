/**
 * MASSA VIEW — Script de Migración Segura de Usuarios a Supabase Auth
 * 
 * Uso:
 *   node scripts/migrate-users-to-auth.mjs --dry-run
 *   node scripts/migrate-users-to-auth.mjs --execute
 * 
 * Reglas de Seguridad:
 * - NUNCA imprime contraseñas en texto plano ni en logs.
 * - Idempotente: omite usuarios que ya existen en auth.users o user_profiles.
 * - NO reutiliza contraseñas heredadas; las considera comprometidas.
 * - Requiere confirmación explícita para ejecución.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

for (const envFile of ['.env.local', '.env.backup.local', '.env']) {
  if (fs.existsSync(envFile)) {
    try {
      process.loadEnvFile(envFile);
    } catch {
      // ignore
    }
  }
}

const isDryRun = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('='.repeat(65));
console.log('MASSA VIEW — PLAN DE MIGRACIÓN A SUPABASE AUTH');
console.log(`Modo: ${isDryRun ? 'SIMULACIÓN (DRY-RUN - Sin escrituras)' : 'EJECUCIÓN CONTROLADA'}`);
console.log('='.repeat(65));

if (!isDryRun && !serviceKey) {
  console.error('\n[ERROR] Se requiere SUPABASE_SERVICE_ROLE_KEY para ejecutar la migración.');
  console.error('Para modo seguro de simulación, ejecuta con: node scripts/migrate-users-to-auth.mjs --dry-run\n');
  process.exit(1);
}

async function runMigration() {
  const supabase = createClient(supabaseUrl || 'http://127.0.0.1:54321', serviceKey || 'mock-key', {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('\n[Paso 1] Inspeccionando tabla heredada massa_3d_users...');
  
  let legacyUsers = [];
  try {
    if (serviceKey) {
      const { data, error } = await supabase.from('massa_3d_users').select('id, username, name, role, active');
      if (error) throw error;
      legacyUsers = data || [];
    } else {
      console.log('  (Simulación local sin credenciales de servicio: utilizando muestra controlada)');
      legacyUsers = [
        { id: 'usr-1', username: 'mateo@massagroup.co', name: 'Mateo Rossi', role: 'architect', active: true },
        { id: 'usr-2', username: 'juan@massagroup.co', name: 'Juan David', role: 'architect', active: true },
        { id: 'usr-3', username: 'cliente.alpha@gmail.com', name: 'Carlos Mendoza', role: 'client', active: true },
        { id: 'usr-4', username: 'cliente.beta@gmail.com', name: 'Laura Restrepo', role: 'client', active: true },
      ];
    }
  } catch (err) {
    console.warn('  Aviso al consultar massa_3d_users:', err.message);
    return;
  }

  console.log(`  Total de cuentas heredadas encontradas: ${legacyUsers.length}`);

  const report = {
    total: legacyUsers.length,
    toMigrate: 0,
    alreadyExists: 0,
    invalidEmail: 0,
    migrated: 0,
    errors: [],
  };

  for (const user of legacyUsers) {
    let email = user.username.trim().toLowerCase();
    if (!email.includes('@')) {
      email = `${email}@massagroup.co`;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      report.invalidEmail++;
      report.errors.push({ user: user.name, reason: 'Correo electrónico con formato inválido' });
      continue;
    }

    const mappedRole = user.role === 'admin' || user.role === 'editor' ? 'architect' : (user.role || 'client');

    if (isDryRun) {
      report.toMigrate++;
      console.log(`  [SIMULACIÓN] Usuario: "${user.name}" -> Email: ${email} | Rol: ${mappedRole}`);
      continue;
    }

    // Modo Ejecución
    try {
      // 1. Verificar si ya existe en auth.users
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);

      let authUserId;
      if (existingUser?.user) {
        authUserId = existingUser.user.id;
        report.alreadyExists++;
        console.log(`  [EXISTENTE] Cuenta ya registrada en Auth: ${email}`);
      } else {
        // Generar contraseña temporal segura de alta entropía (32 bytes aleatorios)
        // El usuario establecerá su propia contraseña mediante el flujo oficial de recuperación/invitación
        const tempSecurePassword = crypto.randomBytes(32).toString('hex') + 'A1!';
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password: tempSecurePassword,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: mappedRole,
            migrated_from_legacy: true,
          },
        });

        if (createError) throw createError;
        authUserId = newUser.user.id;
        report.migrated++;
        console.log(`  [CREADO] Cuenta creada en Supabase Auth: ${email} (ID: ${authUserId})`);
      }

      // 2. Sincronizar en public.user_profiles
      const { error: profileError } = await supabase.from('user_profiles').upsert({
        id: authUserId,
        email,
        name: user.name,
        role: mappedRole,
      });

      if (profileError) {
        throw new Error(`Error en user_profiles: ${profileError.message}`);
      }

    } catch (err) {
      report.errors.push({ email, reason: err.message });
      console.error(`  [ERROR] Falló migración de ${email}:`, err.message);
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log('RESUMEN DEL PROCESO DE MIGRACIÓN:');
  console.log(`- Total de cuentas analizadas: ${report.total}`);
  if (isDryRun) {
    console.log(`- Cuentas listas para migrar:  ${report.toMigrate}`);
  } else {
    console.log(`- Cuentas migradas a Auth:     ${report.migrated}`);
    console.log(`- Cuentas ya existentes:       ${report.alreadyExists}`);
  }
  console.log(`- Correos inválidos:           ${report.invalidEmail}`);
  console.log(`- Errores reportados:          ${report.errors.length}`);
  console.log('='.repeat(65) + '\n');
}

runMigration().catch(console.error);
