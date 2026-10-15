import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDatabase } from './db-helper';
import { PGlite } from '@electric-sql/pglite';

describe('Matriz de Permisos — Rol: Arquitecto Líder (architect)', () => {
  let db: PGlite;
  let setActor: (actor: 'anon' | 'architect' | 'clientA' | 'clientB' | 'admin') => Promise<void>;

  beforeAll(async () => {
    const context = await createTestDatabase();
    db = context.db;
    setActor = context.setActor;
  });

  beforeEach(async () => {
    await setActor('architect');
  });

  it('1. Puede ver todos los proyectos, incluyendo borradores no publicados (PROY-GAMMA)', async () => {
    const res = await db.query<{ id: string; published_for_client: boolean }>(`
      SELECT id, published_for_client FROM public.projects ORDER BY id ASC;
    `);
    expect(res.rows.length).toBe(3);
    const ids = res.rows.map((r) => r.id);
    expect(ids).toEqual(['PROY-ALPHA', 'PROY-BETA', 'PROY-GAMMA']);
  });

  it('2. Puede crear, modificar y eliminar proyectos (CRUD completo)', async () => {
    // INSERT
    await db.query(`
      INSERT INTO public.projects (id, current_phase, published_for_client)
      VALUES ('PROY-NUEVO', 'Fase 0: Topografía', false);
    `);
    const checkInsert = await db.query(`SELECT id FROM public.projects WHERE id = 'PROY-NUEVO';`);
    expect(checkInsert.rows.length).toBe(1);

    // UPDATE
    await db.query(`
      UPDATE public.projects SET current_progress = 15 WHERE id = 'PROY-NUEVO';
    `);
    const checkUpdate = await db.query<{ current_progress: number }>(`
      SELECT current_progress FROM public.projects WHERE id = 'PROY-NUEVO';
    `);
    expect(checkUpdate.rows[0].current_progress).toBe(15);

    // DELETE
    await db.query(`DELETE FROM public.projects WHERE id = 'PROY-NUEVO';`);
    const checkDelete = await db.query(`SELECT id FROM public.projects WHERE id = 'PROY-NUEVO';`);
    expect(checkDelete.rows.length).toBe(0);
  });

  it('3. Puede ver y gestionar todos los perfiles de usuario (user_profiles)', async () => {
    const res = await db.query<{ id: string; role: string }>(`SELECT id, role FROM public.user_profiles;`);
    expect(res.rows.length).toBe(3); // Arquitecto, Cliente A y Cliente B
  });

  it('4. Puede ver y gestionar todos los medios técnicos publicados y no publicados', async () => {
    const res = await db.query<{ id: string; published: boolean }>(`SELECT id, published FROM public.project_media;`);
    expect(res.rows.length).toBe(3);
    const unpublished = res.rows.filter((r) => !r.published);
    expect(unpublished.length).toBeGreaterThan(0);
  });

  it('5. Puede ver y gestionar hitos de avance y sus medios (incluyendo borradores)', async () => {
    const updates = await db.query(`SELECT id, published FROM public.progress_updates;`);
    expect(updates.rows.length).toBe(2);

    const media = await db.query(`SELECT id FROM public.progress_media;`);
    expect(media.rows.length).toBe(2);
  });

  it('6. Puede leer analíticas completas de visitas en tour_visits', async () => {
    // Anon registra una visita
    await setActor('anon');
    await db.query(`
      INSERT INTO public.tour_visits (project_id, project_name, platform)
      VALUES ('PROY-ALPHA', 'Villa Serendipia', 'Web-Chrome');
    `);

    // Arquitecto lee las métricas
    await setActor('architect');
    const analytics = await db.query(`SELECT * FROM public.tour_visits;`);
    expect(analytics.rows.length).toBeGreaterThan(0);
  });

  it('7. Tiene acceso total de lectura a todos los buckets de Storage', async () => {
    const vaultFiles = await db.query(`
      SELECT * FROM storage.objects WHERE bucket_id = 'project-vault';
    `);
    expect(vaultFiles.rows.length).toBe(2); // Archivos de PROY-ALPHA y PROY-BETA
  });
});
