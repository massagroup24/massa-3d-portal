import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDatabase, TEST_ACTORS } from './db-helper';
import { PGlite } from '@electric-sql/pglite';

describe('Matriz de Permisos — Rol: Cliente Autenticado (Cliente A y Cliente B)', () => {
  let db: PGlite;
  let setActor: (actor: 'anon' | 'architect' | 'clientA' | 'clientB' | 'admin') => Promise<void>;

  beforeAll(async () => {
    const context = await createTestDatabase();
    db = context.db;
    setActor = context.setActor;
  });

  describe('Cliente A (asignado a PROY-ALPHA)', () => {
    beforeEach(async () => {
      await setActor('clientA');
    });

    it('1. Solo puede ver su proyecto asignado (PROY-ALPHA) y publicado', async () => {
      const res = await db.query<{ id: string }>(`SELECT id FROM public.projects;`);
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].id).toBe('PROY-ALPHA');
    });

    it('2. NO puede ver proyectos de otros clientes (PROY-BETA) ni borradores (PROY-GAMMA)', async () => {
      const res = await db.query<{ id: string }>(`
        SELECT id FROM public.projects 
        WHERE id IN ('PROY-BETA', 'PROY-GAMMA');
      `);
      expect(res.rows.length).toBe(0);
    });

    it('3. Solo puede ver medios técnicos publicados (published = true)', async () => {
      const res = await db.query<{ id: string; title: string; published: boolean }>(`
        SELECT id, title, published FROM public.project_media;
      `);
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].title).toBe('Fachada Principal');
      expect(res.rows[0].published).toBe(true);

      const confidential = res.rows.find((r) => r.title === 'Plano Estructural Reservado');
      expect(confidential).toBeUndefined();
    });

    it('4. Solo puede ver hitos de avance publicados (published = true)', async () => {
      const res = await db.query<{ id: string; phase_title: string; published: boolean }>(`
        SELECT id, phase_title, published FROM public.progress_updates;
      `);
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].phase_title).toBe('Fundición de losa');
      expect(res.rows[0].published).toBe(true);
    });

    it('5. Solo puede ver fotos de avance vinculadas a hitos publicados', async () => {
      const res = await db.query<{ id: string; caption: string }>(`
        SELECT id, caption FROM public.progress_media;
      `);
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].caption).toBe('Losa fraguada');
    });

    it('6. Solo puede leer su propio perfil en user_profiles, no el de otros clientes ni del arquitecto', async () => {
      const res = await db.query<{ id: string; email: string }>(`
        SELECT id, email FROM public.user_profiles;
      `);
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].id).toBe(TEST_ACTORS.clientA.id);
      expect(res.rows[0].email).toBe(TEST_ACTORS.clientA.email);
    });

    it('7. NO puede escalar privilegios cambiando su rol a architect', async () => {
      const updateRes = await db.query(`
        UPDATE public.user_profiles 
        SET role = 'architect' 
        WHERE id = $1;
      `, [TEST_ACTORS.clientA.id]);

      expect(updateRes.affectedRows).toBe(0);

      // Verificamos que el rol sigue siendo 'client'
      const checkRes = await db.query<{ role: string }>(`
        SELECT role FROM public.user_profiles WHERE id = $1;
      `, [TEST_ACTORS.clientA.id]);
      expect(checkRes.rows[0].role).toBe('client');
    });

    it('8. NO puede insertar, modificar ni borrar proyectos', async () => {
      // Intento de INSERT bloqueado por RLS
      await expect(
        db.query(`
          INSERT INTO public.projects (id, current_phase) 
          VALUES ('PROY-HACK', 'Fase Maliciosa');
        `)
      ).rejects.toThrow(/row-level security/i);

      // Intento de UPDATE
      const updateRes = await db.query(`
        UPDATE public.projects 
        SET current_phase = 'Fase Alterada' 
        WHERE id = 'PROY-ALPHA';
      `);
      expect(updateRes.affectedRows).toBe(0);

      // Intento de DELETE
      const deleteRes = await db.query(`DELETE FROM public.projects WHERE id = 'PROY-ALPHA';`);
      expect(deleteRes.affectedRows).toBe(0);
    });

    it('9. En Storage project-vault solo ve archivos de su proyecto (PROY-ALPHA)', async () => {
      const vaultRes = await db.query<{ name: string }>(`
        SELECT name FROM storage.objects 
        WHERE bucket_id = 'project-vault';
      `);
      expect(vaultRes.rows.length).toBe(1);
      expect(vaultRes.rows[0].name.startsWith('projects/PROY-ALPHA/')).toBe(true);

      const betaFiles = vaultRes.rows.filter((r) => r.name.startsWith('projects/PROY-BETA/'));
      expect(betaFiles.length).toBe(0);
    });
  });

  describe('Cliente B (asignado a PROY-BETA)', () => {
    beforeEach(async () => {
      await setActor('clientB');
    });

    it('10. Aislamiento cruzado: Cliente B solo ve PROY-BETA y no puede acceder a PROY-ALPHA', async () => {
      const res = await db.query<{ id: string }>(`SELECT id FROM public.projects;`);
      expect(res.rows.length).toBe(1);
      expect(res.rows[0].id).toBe('PROY-BETA');

      const mediaRes = await db.query<{ project_id: string }>(`SELECT project_id FROM public.project_media;`);
      expect(mediaRes.rows.length).toBe(1);
      expect(mediaRes.rows[0].project_id).toBe('PROY-BETA');
    });
  });
});
