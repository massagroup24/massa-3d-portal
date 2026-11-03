import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'node:fs';
import type { PGlite } from '@electric-sql/pglite';
import { createTestDatabase, TEST_ACTORS } from './db-helper';

const ownerId = '99999999-9999-4999-8999-999999999999';
const migration = (name: string) => fs.readFileSync(`supabase/migrations/${name}.sql`, 'utf8');
const corrective = () => migration('20261103_06_single_owner_and_published_catalog');

describe('Cuenta única y catálogo publicado: migraciones SQL reales 04, 05 y 06', () => {
  let db: PGlite;
  async function actor(id: string | null = null) {
    await db.exec(`SET ROLE ${id ? 'authenticated' : 'anon'};`);
    await db.query(`SELECT set_config('request.jwt.claim.sub', $1, false)`, [id || '']);
  }
  async function root() { await db.exec(`SET ROLE postgres; SET request.jwt.claim.sub = '';`); }
  beforeAll(async () => {
    ({ db } = await createTestDatabase());
    // Estructura mínima de los servicios Auth y Storage que usan las migraciones.
    await db.exec(`
      CREATE ROLE supabase_auth_admin NOSUPERUSER;
      ALTER TABLE auth.users ADD COLUMN raw_user_meta_data jsonb DEFAULT '{}',
        ADD COLUMN raw_app_meta_data jsonb DEFAULT '{}',
        ADD COLUMN email_confirmed_at timestamptz DEFAULT now(),
        ADD COLUMN banned_until timestamptz,
        ADD COLUMN updated_at timestamptz DEFAULT now();
      ALTER TABLE storage.buckets ADD COLUMN file_size_limit bigint,
        ADD COLUMN allowed_mime_types text[];
      INSERT INTO auth.users(id,email) VALUES ('${ownerId}', 'juandavidfigueroa4@gmail.com');
    `);
    await db.exec(migration('20261019_04_single_admin_login_and_commercial_pivot'));
    await db.exec(migration('20261030_05_allow_tour_images_storage_policies'));
    // Verificar también el cierre de privilegios de RPC heredadas.
    await db.exec(`
      CREATE FUNCTION public.admin_delete_user(uuid) RETURNS void LANGUAGE sql SECURITY DEFINER AS 'SELECT';
      CREATE FUNCTION public.admin_create_user(text,text,text,text,text) RETURNS void LANGUAGE sql SECURITY DEFINER AS 'SELECT';
      CREATE TRIGGER test_auth_sync AFTER INSERT OR UPDATE OF email, raw_user_meta_data, raw_app_meta_data
        ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();
      UPDATE public.projects SET data = jsonb_build_object('id',id,'name',id,'pin','private-pin','clientName','Private',
        'rooms',jsonb_build_object('one',jsonb_build_object('imageUrl',
        'https://nsiglkllgsgilwmdxkuu.supabase.co/storage/v1/object/public/tour-images/projects/' || id || '/pan.jpg')));
      INSERT INTO storage.objects(bucket_id,name) VALUES
        ('tour-images','projects/PROY-ALPHA/pan.jpg'),
        ('tour-images','projects/PROY-GAMMA/pan.jpg'),
        ('tour-images','projects/PROY-ALPHA/unreferenced.jpg'),
        ('project-vault','projects/PROY-ALPHA/blueprints/plano_confidencial.pdf');
    `);
    await db.exec(corrective());
    await db.exec(corrective()); // La nueva migración puede repetirse sin reabrir permisos.
  }, 30000);
  beforeEach(async () => { await actor(); });
  afterAll(async () => { await db?.close(); });

  it('vincula una sola identidad por UUID sin exponer la tabla de autorización', async () => {
    expect((await db.query(`SELECT public.is_platform_admin() AS allowed`)).rows).toEqual([{ allowed: false }]);
    await expect(db.query(`SELECT * FROM public.platform_admin`)).rejects.toThrow(/permission denied/);
    await actor(ownerId);
    expect((await db.query(`SELECT public.is_platform_admin() AS allowed`)).rows).toEqual([{ allowed: true }]);
  });
  it('no conserva privilegios de arquitectos anteriores ni admite metadatos elevados', async () => {
    await actor(TEST_ACTORS.architect.id);
    expect((await db.query(`SELECT public.is_architect() AS allowed`)).rows).toEqual([{ allowed: false }]);
    expect((await db.query(`UPDATE public.projects SET current_progress = 99`)).affectedRows).toBe(0);
    await root();
    await db.query(`UPDATE auth.users SET raw_user_meta_data = '{"role":"admin"}' WHERE id = $1`, [TEST_ACTORS.architect.id]);
    await actor(TEST_ACTORS.architect.id);
    expect((await db.query(`SELECT public.is_platform_admin() AS allowed`)).rows).toEqual([{ allowed: false }]);
    expect((await db.query(`SELECT role FROM public.user_profiles WHERE id = auth.uid()`)).rows).toEqual([{ role: 'client' }]);
  });
  it('los visitantes leen solo proyectos publicados y sin datos privados', async () => {
    const rows = (await db.query<{ id: string; data: Record<string, unknown> }>(`SELECT * FROM public.public_projects ORDER BY id`)).rows;
    expect(rows.map(row => row.id)).toEqual(['PROY-ALPHA', 'PROY-BETA']);
    expect(rows[0].data).not.toHaveProperty('pin');
    expect(rows[0].data).not.toHaveProperty('clientName');
    expect((await db.query(`SELECT * FROM public.projects`)).rows).toHaveLength(0);
    expect((await db.query(`SELECT * FROM public.public_tours_360 WHERE id = 'PROY-GAMMA'`)).rows).toHaveLength(0);
  });
  it('filtra medios y fotos no publicados aunque el proyecto sea público', async () => {
    expect((await db.query(`SELECT * FROM public.project_media`)).rows).toHaveLength(2);
    expect((await db.query(`SELECT * FROM public.progress_updates`)).rows).toHaveLength(1);
    expect((await db.query(`SELECT * FROM public.progress_media`)).rows).toHaveLength(1);
    expect((await db.query(`SELECT * FROM public.user_profiles`)).rows).toHaveLength(0);
  });
  it('los buckets son privados y solo se leen referencias publicadas', async () => {
    const rows = (await db.query<{ name: string }>(`SELECT name FROM storage.objects ORDER BY name`)).rows.map(row => row.name);
    expect(rows).toContain('projects/PROY-ALPHA/pan.jpg');
    expect(rows).toContain('projects/PROY-ALPHA/renders/fachada.jpg');
    expect(rows).not.toContain('projects/PROY-GAMMA/pan.jpg');
    expect(rows).not.toContain('projects/PROY-ALPHA/unreferenced.jpg');
    expect(rows).not.toContain('projects/PROY-ALPHA/blueprints/plano_confidencial.pdf');
    await root();
    expect((await db.query(`SELECT public FROM storage.buckets WHERE id IN ('tour-images','project-vault')`)).rows).toEqual([{ public: false }, { public: false }]);
  });
  it.each([null, TEST_ACTORS.clientA.id, TEST_ACTORS.architect.id])('impide subir, sobrescribir y borrar imágenes como %s', async id => {
    await actor(id);
    await expect(db.query(`INSERT INTO storage.objects(bucket_id,name) VALUES ('tour-images','hacked.jpg')`)).rejects.toThrow(/row-level security/);
    expect((await db.query(`UPDATE storage.objects SET name = 'hacked.jpg' WHERE bucket_id = 'tour-images'`)).affectedRows).toBe(0);
    expect((await db.query(`DELETE FROM storage.objects WHERE bucket_id = 'tour-images'`)).affectedRows).toBe(0);
  });
  it('el dueño puede editar proyectos y administrar imágenes', async () => {
    await actor(ownerId);
    expect((await db.query(`SELECT * FROM public.projects`)).rows).toHaveLength(3);
    await db.query(`INSERT INTO storage.objects(bucket_id,name) VALUES ('tour-images','owner-test.jpg')`);
    expect((await db.query(`UPDATE storage.objects SET name = 'owner-updated.jpg' WHERE name = 'owner-test.jpg'`)).affectedRows).toBe(1);
    expect((await db.query(`DELETE FROM storage.objects WHERE name = 'owner-updated.jpg'`)).affectedRows).toBe(1);
    expect((await db.query(`UPDATE public.projects SET current_progress = 6 WHERE id = 'PROY-GAMMA'`)).affectedRows).toBe(1);
  });
  it('retirar un proyecto impide nuevas lecturas de sus medios y archivos', async () => {
    await actor(ownerId);
    await db.query(`UPDATE public.projects SET published_for_client = false WHERE id = 'PROY-ALPHA'`);
    try {
      await actor();
      expect((await db.query(`SELECT * FROM public.public_projects WHERE id = 'PROY-ALPHA'`)).rows).toHaveLength(0);
      expect((await db.query(`SELECT * FROM public.project_media WHERE project_id = 'PROY-ALPHA'`)).rows).toHaveLength(0);
      expect((await db.query(`SELECT * FROM storage.objects WHERE name LIKE 'projects/PROY-ALPHA/%'`)).rows).toHaveLength(0);
    } finally {
      await actor(ownerId);
      await db.query(`UPDATE public.projects SET published_for_client = true WHERE id = 'PROY-ALPHA'`);
    }
  });
  it('ni el dueño puede usar las RPC heredadas de altas y bajas o cambiar la lista desde la API', async () => {
    await actor(ownerId);
    await expect(db.query(`SELECT public.admin_delete_user(auth.uid())`)).rejects.toThrow(/permission denied/);
    await expect(db.query(`SELECT public.admin_create_user('x','x','x','admin',null)`)).rejects.toThrow(/permission denied/);
    await expect(db.query(`UPDATE public.platform_admin SET user_id = auth.uid()`)).rejects.toThrow(/permission denied/);
    await expect(db.query(`UPDATE public.user_profiles SET role = 'admin'`)).rejects.toThrow(/permission denied/);
  });
  it('una cuenta nueva con correo admin y metadatos admin recibe rol client', async () => {
    await root();
    await db.exec(`INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES ('88888888-8888-4888-8888-888888888888','admin-falso@massagroup.co','{"role":"admin"}')`);
    expect((await db.query(`SELECT role FROM public.user_profiles WHERE email = 'admin-falso@massagroup.co'`)).rows).toEqual([{ role: 'client' }]);
  });
  it('el hook de Auth permite emitir tokens solo para la identidad vinculada', async () => {
    await root();
    await db.exec(`SET ROLE supabase_auth_admin`);
    const ownerEvent = { user_id: ownerId, claims: { sub: ownerId, role: 'authenticated' } };
    expect((await db.query<{ result: unknown }>(`SELECT public.platform_access_token_hook($1::jsonb) AS result`, [JSON.stringify(ownerEvent)])).rows[0].result).toEqual(ownerEvent);
    const otherEvent = { user_id: TEST_ACTORS.architect.id, claims: { sub: TEST_ACTORS.architect.id } };
    const denied = (await db.query<{ result: { error: { http_code: number } } }>(`SELECT public.platform_access_token_hook($1::jsonb) AS result`, [JSON.stringify(otherEvent)])).rows[0].result;
    expect(denied.error.http_code).toBe(403);
    await actor(ownerId);
    await expect(db.query(`SELECT public.platform_access_token_hook('{}')`)).rejects.toThrow(/permission denied/);
  });
  it('aborta sin cambios parciales si la cuenta autorizada deja de estar confirmada', async () => {
    await root();
    await db.query(`UPDATE auth.users SET email_confirmed_at = NULL WHERE id = $1`, [ownerId]);
    try {
      await expect(db.exec(corrective())).rejects.toThrow();
      await db.exec('ROLLBACK');
      expect((await db.query(`SELECT count(*)::int AS total FROM public.platform_admin`)).rows).toEqual([{ total: 1 }]);
      expect((await db.query(`SELECT count(*)::int AS total FROM public.public_projects`)).rows).toEqual([{ total: 2 }]);
    } finally {
      await root();
      await db.query(`UPDATE auth.users SET email_confirmed_at = now() WHERE id = $1`, [ownerId]);
    }
  });
  it('aplica la selección inicial a los cuatro proyectos exactos sin cambiar otros registros', async () => {
    await root();
    const ids = ['project_hacienda_f22', 'project_ibiza_a14', 'project_1781963945215', 'project_1782912175010'];
    const setup = fs.readFileSync('supabase/publicacion_inicial_paso_1.sql', 'utf8');
    try {
      for (const id of ids) {
        await db.query(`INSERT INTO public.projects(id, data, published_for_client) VALUES ($1, jsonb_build_object('name', $1::text), $2)`, [id, id.startsWith('project_178')]);
      }
      await db.exec(setup);
      await actor();
      const visible = (await db.query<{ id: string }>(`SELECT id FROM public.public_projects ORDER BY id`)).rows.map(row => row.id);
      expect(visible).toEqual(['PROY-ALPHA', 'PROY-BETA', 'project_hacienda_f22', 'project_ibiza_a14']);
      await root();
      const selected = (await db.query<{ id: string; published_for_client: boolean }>(`SELECT id, published_for_client FROM public.projects WHERE id = ANY($1::text[])`, [ids])).rows;
      expect(selected.filter(row => row.published_for_client).map(row => row.id).sort()).toEqual(ids.slice(0, 2).sort());
    } finally {
      await root();
      await db.query(`DELETE FROM public.projects WHERE id = ANY($1::text[])`, [ids]);
    }
  });
});
