import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';

export interface TestActors {
  architect: { id: string; email: string; name: string };
  clientA: { id: string; email: string; name: string; projectId: string };
  clientB: { id: string; email: string; name: string; projectId: string };
}

export const TEST_ACTORS: TestActors = {
  architect: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'mateo@massagroup.co',
    name: 'Mateo Rossi',
  },
  clientA: {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'cliente.a@gmail.com',
    name: 'Carlos Mendoza',
    projectId: 'PROY-ALPHA',
  },
  clientB: {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'cliente.b@gmail.com',
    name: 'Laura Restrepo',
    projectId: 'PROY-BETA',
  },
};

export async function createTestDatabase() {
  const db = new PGlite();

  // 1. Auth & Storage foundational schemas required by Supabase extensions
  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$ LANGUAGE sql STABLE;

    CREATE SCHEMA IF NOT EXISTS storage;
    CREATE TABLE IF NOT EXISTS storage.buckets (
      id TEXT PRIMARY KEY,
      name TEXT,
      public BOOLEAN DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS storage.objects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket_id TEXT REFERENCES storage.buckets(id),
      name TEXT,
      owner UUID,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      last_accessed_at TIMESTAMPTZ DEFAULT now(),
      metadata JSONB DEFAULT '{}'::jsonb
    );
    CREATE OR REPLACE FUNCTION storage.foldername(name text)
    RETURNS text[] AS $$
      SELECT string_to_array(name, '/');
    $$ LANGUAGE sql IMMUTABLE;

    -- Roles de PostgREST / Supabase
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOSUPERUSER;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOSUPERUSER;
      END IF;
    END $$;
  `);

  // 2. Load and apply consolidated test schema
  const schemaPath = path.resolve(process.cwd(), 'supabase/schema_test_env.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await db.exec(schemaSql);

  // Grant access on public, storage, auth schemas to anon and authenticated
  await db.exec(`
    GRANT USAGE ON SCHEMA public, auth, storage TO anon, authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
  `);

  // 3. Seed test users (as postgres superuser)
  const { architect, clientA, clientB } = TEST_ACTORS;

  // Insert auth users
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, $2);`, [architect.id, architect.email]);
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, $2);`, [clientA.id, clientA.email]);
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, $2);`, [clientB.id, clientB.email]);

  // Insert user profiles
  await db.query(
    `INSERT INTO public.user_profiles (id, email, name, role, phone) VALUES ($1, $2, $3, 'architect', '+57 300 000 0000');`,
    [architect.id, architect.email, architect.name]
  );
  await db.query(
    `INSERT INTO public.user_profiles (id, email, name, role, phone) VALUES ($1, $2, $3, 'client', '+57 311 111 1111');`,
    [clientA.id, clientA.email, clientA.name]
  );
  await db.query(
    `INSERT INTO public.user_profiles (id, email, name, role, phone) VALUES ($1, $2, $3, 'client', '+57 322 222 2222');`,
    [clientB.id, clientB.email, clientB.name]
  );

  // Seed projects
  // PROY-ALPHA (published, assigned to Client A)
  await db.query(`
    INSERT INTO public.projects (id, data, current_phase, current_progress, published_for_client, architect_name, architect_phone)
    VALUES ('PROY-ALPHA', '{"name": "Villa Serendipia", "panoramas": ["pan1"]}', 'Estructura', 45, true, 'Mateo Rossi', '+57 300 123 4567');
  `);

  // PROY-BETA (published, assigned to Client B)
  await db.query(`
    INSERT INTO public.projects (id, data, current_phase, current_progress, published_for_client, architect_name, architect_phone)
    VALUES ('PROY-BETA', '{"name": "Torre Mirador", "panoramas": ["pan2"]}', 'Cimentación', 20, true, 'Mateo Rossi', '+57 300 123 4567');
  `);

  // PROY-GAMMA (unpublished draft, internal only)
  await db.query(`
    INSERT INTO public.projects (id, data, current_phase, current_progress, published_for_client, architect_name, architect_phone)
    VALUES ('PROY-GAMMA', '{"name": "Residencia Oculta", "panoramas": []}', 'Diseño Preliminar', 5, false, 'Mateo Rossi', '+57 300 123 4567');
  `);

  // Seed memberships
  await db.query(`INSERT INTO public.project_members (project_id, user_id) VALUES ('PROY-ALPHA', $1);`, [clientA.id]);
  await db.query(`INSERT INTO public.project_members (project_id, user_id) VALUES ('PROY-BETA', $1);`, [clientB.id]);

  // Seed project media
  // PROY-ALPHA: 1 published render, 1 unpublished blueprint
  await db.query(`
    INSERT INTO public.project_media (id, project_id, type, title, storage_path, published)
    VALUES ('aaaaaaaa-1111-0000-0000-000000000001', 'PROY-ALPHA', 'render', 'Fachada Principal', 'projects/PROY-ALPHA/renders/fachada.jpg', true);
  `);
  await db.query(`
    INSERT INTO public.project_media (id, project_id, type, title, storage_path, published)
    VALUES ('aaaaaaaa-1111-0000-0000-000000000002', 'PROY-ALPHA', 'blueprint', 'Plano Estructural Reservado', 'projects/PROY-ALPHA/blueprints/plano_confidencial.pdf', false);
  `);

  // PROY-BETA: 1 published render
  await db.query(`
    INSERT INTO public.project_media (id, project_id, type, title, storage_path, published)
    VALUES ('bbbbbbbb-2222-0000-0000-000000000001', 'PROY-BETA', 'render', 'Lobby Torre', 'projects/PROY-BETA/renders/lobby.jpg', true);
  `);

  // Seed progress updates & media
  // PROY-ALPHA: 1 published update with 1 photo, 1 unpublished update with 1 photo
  await db.query(`
    INSERT INTO public.progress_updates (id, project_id, percentage, phase_title, notes, published, recorded_at)
    VALUES ('cccccccc-3333-0000-0000-000000000001', 'PROY-ALPHA', 45, 'Fundición de losa', 'Hito completado con éxito', true, now());
  `);
  await db.query(`
    INSERT INTO public.progress_media (id, update_id, kind, storage_path, caption)
    VALUES ('dddddddd-4444-0000-0000-000000000001', 'cccccccc-3333-0000-0000-000000000001', 'photo', 'projects/PROY-ALPHA/updates/foto1.jpg', 'Losa fraguada');
  `);

  await db.query(`
    INSERT INTO public.progress_updates (id, project_id, percentage, phase_title, notes, published, recorded_at)
    VALUES ('cccccccc-3333-0000-0000-000000000002', 'PROY-ALPHA', 50, 'Inspección interna pendiente', 'Notas de control interno', false, now());
  `);
  await db.query(`
    INSERT INTO public.progress_media (id, update_id, kind, storage_path, caption)
    VALUES ('dddddddd-4444-0000-0000-000000000002', 'cccccccc-3333-0000-0000-000000000002', 'photo', 'projects/PROY-ALPHA/updates/foto_interna.jpg', 'Foto interna de control');
  `);

  // Seed storage objects: bucket project-vault has hierarchy projects/:projectId/...
  await db.query(`
    INSERT INTO storage.objects (id, bucket_id, name)
    VALUES 
      ('eeeeeeee-5555-0000-0000-000000000001', 'project-vault', 'projects/PROY-ALPHA/renders/fachada.jpg'),
      ('eeeeeeee-5555-0000-0000-000000000002', 'project-vault', 'projects/PROY-BETA/renders/lobby.jpg'),
      ('eeeeeeee-5555-0000-0000-000000000003', 'tour-images', 'panoramas/pan1.jpg');
  `);

  return {
    db,
    setActor: async (actor: 'anon' | 'architect' | 'clientA' | 'clientB' | 'admin') => {
      if (actor === 'admin') {
        await db.query(`SET ROLE postgres;`);
        await db.query(`SET request.jwt.claim.sub = '';`);
      } else if (actor === 'anon') {
        await db.query(`SET ROLE anon;`);
        await db.query(`SET request.jwt.claim.sub = '';`);
      } else if (actor === 'architect') {
        await db.query(`SET ROLE authenticated;`);
        await db.query(`SET request.jwt.claim.sub = '${architect.id}';`);
      } else {
        const userId = TEST_ACTORS[actor].id;
        await db.query(`SET ROLE authenticated;`);
        await db.query(`SET request.jwt.claim.sub = '${userId}';`);
      }
    },
  };
}
