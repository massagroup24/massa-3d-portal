import { describe, it, expect, beforeAll } from 'vitest';
import { createTestDatabase } from './db-helper';
import { PGlite } from '@electric-sql/pglite';

describe('Pruebas Transversales de Seguridad y Arquitectura RLS', () => {
  let db: PGlite;

  beforeAll(async () => {
    const context = await createTestDatabase();
    db = context.db;
  });

  it('1. Todas las tablas críticas en public tienen RLS activado (relrowsecurity = true)', async () => {
    const res = await db.query<{ tablename: string; rowsecurity: boolean }>(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN (
          'projects',
          'user_profiles',
          'project_members',
          'project_media',
          'progress_updates',
          'progress_media',
          'tour_visits'
        );
    `);

    expect(res.rows.length).toBe(7);
    for (const table of res.rows) {
      expect(table.rowsecurity).toBe(true);
    }
  });

  it('2. Ninguna tabla del nuevo modelo almacena contraseñas en texto plano', async () => {
    const res = await db.query<{ column_name: string }>(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
        AND column_name IN ('password', 'raw_password', 'plain_password', 'pin', 'secret');
    `);
    expect(res.rows.length).toBe(0);
  });

  it('3. La vista public_tours_360 solo proyecta campos sanitizados (id, data)', async () => {
    const res = await db.query<{ column_name: string }>(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'public_tours_360';
    `);
    const cols = res.rows.map((r) => r.column_name);
    expect(cols).toEqual(['id', 'data']);
    expect(cols).not.toContain('architect_phone');
    expect(cols).not.toContain('architect_whatsapp');
  });

  it('4. Funciones críticas SECURITY DEFINER tienen search_path fijado para prevenir secuestro de búsqueda', async () => {
    const res = await db.query<{ proname: string; prosecdef: boolean; proconfig: string[] }>(`
      SELECT proname, prosecdef, proconfig
      FROM pg_proc
      JOIN pg_namespace n ON n.oid = pg_proc.pronamespace
      WHERE n.nspname = 'public'
        AND proname IN ('is_architect', 'client_has_project', 'handle_updated_at');
    `);

    expect(res.rows.length).toBe(3);
    for (const fn of res.rows) {
      expect(fn.prosecdef).toBe(true);
      expect(fn.proconfig).toBeDefined();
      expect(fn.proconfig.some((c) => c.startsWith('search_path='))).toBe(true);
    }
  });
});
