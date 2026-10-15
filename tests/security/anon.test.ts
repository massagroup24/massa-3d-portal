import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { createTestDatabase } from './db-helper';
import { PGlite } from '@electric-sql/pglite';

describe('Matriz de Permisos — Rol: Visitante Anónimo (anon)', () => {
  let db: PGlite;
  let setActor: (actor: 'anon' | 'architect' | 'clientA' | 'clientB' | 'admin') => Promise<void>;

  beforeAll(async () => {
    const context = await createTestDatabase();
    db = context.db;
    setActor = context.setActor;
  });

  beforeEach(async () => {
    await setActor('anon');
  });

  it('1. Puede leer la vista sanitizada de tours públicos (public_tours_360) para recorridos 360', async () => {
    const res = await db.query<{ id: string; data: any }>(`SELECT id, data FROM public.public_tours_360;`);
    expect(res.rows.length).toBeGreaterThan(0);
    const alpha = res.rows.find((r) => r.id === 'PROY-ALPHA');
    expect(alpha).toBeDefined();
    expect(alpha?.data).toBeDefined();
  });

  it('2. NO puede leer la tabla base de proyectos directamente', async () => {
    const res = await db.query(`SELECT * FROM public.projects;`);
    expect(res.rows.length).toBe(0);
  });

  it('3. NO puede leer perfiles de usuarios (user_profiles)', async () => {
    const res = await db.query(`SELECT * FROM public.user_profiles;`);
    expect(res.rows.length).toBe(0);
  });

  it('4. NO puede leer asignaciones de clientes (project_members)', async () => {
    const res = await db.query(`SELECT * FROM public.project_members;`);
    expect(res.rows.length).toBe(0);
  });

  it('5. NO puede leer medios técnicos ni renders privados (project_media)', async () => {
    const res = await db.query(`SELECT * FROM public.project_media;`);
    expect(res.rows.length).toBe(0);
  });

  it('6. NO puede leer bitácora de obra ni hitos (progress_updates)', async () => {
    const res = await db.query(`SELECT * FROM public.progress_updates;`);
    expect(res.rows.length).toBe(0);
  });

  it('7. NO puede leer fotos de avance de obra (progress_media)', async () => {
    const res = await db.query(`SELECT * FROM public.progress_media;`);
    expect(res.rows.length).toBe(0);
  });

  it('8. PUEDE insertar registro de analítica en tour_visits al visitar un 360', async () => {
    await db.query(`
      INSERT INTO public.tour_visits (project_id, project_name, platform)
      VALUES ('PROY-ALPHA', 'Villa Serendipia', 'Web-Safari');
    `);

    // Comprobamos que como anon NO puede leer el registro recién insertado
    const readAttempt = await db.query(`SELECT * FROM public.tour_visits;`);
    expect(readAttempt.rows.length).toBe(0);
  });

  it('9. NO puede modificar (UPDATE) ni borrar (DELETE) registros en tour_visits', async () => {
    const updateRes = await db.query(`UPDATE public.tour_visits SET project_name = 'Hacked';`);
    expect(updateRes.affectedRows).toBe(0);

    const deleteRes = await db.query(`DELETE FROM public.tour_visits;`);
    expect(deleteRes.affectedRows).toBe(0);
  });

  it('10. NO puede leer ni descargar archivos del bucket privado project-vault', async () => {
    const vaultRes = await db.query(`
      SELECT * FROM storage.objects 
      WHERE bucket_id = 'project-vault';
    `);
    expect(vaultRes.rows.length).toBe(0);
  });

  it('11. PUEDE leer archivos del bucket público tour-images para visualización 360', async () => {
    const tourRes = await db.query(`
      SELECT * FROM storage.objects 
      WHERE bucket_id = 'tour-images';
    `);
    expect(tourRes.rows.length).toBeGreaterThan(0);
  });
});
