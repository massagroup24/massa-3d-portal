import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { applyF22VerifiedSpecs, HACIENDA_F22_TECHNICAL as specs, F22_AREA_BUILT, F22_LOT_AREA, technicalRowGroups } from '../../src/data/haciendaF22Specs';
import { projectsData, normalizeProject, type Project } from '../../src/data/tourData';
import { COMMERCIAL_RESIDENCES } from '../../src/data/commercialData';
import { PROJECT_IDENTITIES, HACIENDA_F22_LEVELS, HACIENDA_F22_ROOMS_360 } from '../../src/config/projectIdentityConfig';
import { getProjectPublicSpecs, HACIENDA_F22_BLUEPRINTS } from '../../src/services/portalService';
import { ProjectSpecs } from '../../src/components/portal/ProjectSpecs';
import { getProjectsFromSupabase, saveProjectToSupabase, supabase } from '../../src/supabase';

afterEach(() => vi.restoreAllMocks());
const f22 = projectsData.project_hacienda_f22;

describe('Transcripción y consistencia de las especificaciones reales F22', () => {
  it('mantiene exactamente las áreas del documento y sus totales sin sumar la piscina a construcción', () => {
    expect(specs.areas).toEqual({ lot: 644, firstFloor: 223.78, kiosk: 42.32, poolZone: 56.96, firstFloorTotal: 323.06, secondFloor: 198.78, thirdFloor: 50, openArea: 320.94, totalConstruction: 514.88 });
    const a = specs.areas;
    expect(a.firstFloor + a.kiosk + a.poolZone).toBeCloseTo(a.firstFloorTotal);
    expect(a.firstFloorTotal + a.openArea).toBeCloseTo(a.lot);
    expect(a.firstFloor + a.kiosk + a.secondFloor + a.thirdFloor).toBeCloseTo(a.totalConstruction);
  });
  it('transcribe ambos índices y las cinco condiciones de ocupación', () => {
    expect(specs.indices).toEqual({ occupation: 0.41, construction: 0.8 });
    expect(specs.occupancy).toEqual({ group: 'Residencial', subgroup: 'R1', exits: 2, riskCategory: 'I', occupantLoad: 21 });
    expect(technicalRowGroups(specs).flatMap(group => group.rows)).toHaveLength(16);
  });
  it('presenta los mismos datos en catálogo, identidad, ficha pública y planos', () => {
    const commercial = COMMERCIAL_RESIDENCES.find(project => project.id === f22.id)!;
    const identity = PROJECT_IDENTITIES[f22.id];
    const publicSpecs = getProjectPublicSpecs('HACIENDA F22');
    expect([f22.areaBuilt, commercial.areaBuilt, identity.specs.areaBuilt, publicSpecs.areaBuilt]).toEqual(Array(4).fill(F22_AREA_BUILT));
    expect([f22.areaLot, commercial.areaLot, identity.specs.lotArea, publicSpecs.lotArea]).toEqual(Array(4).fill(F22_LOT_AREA));
    expect(HACIENDA_F22_LEVELS.map(level => level.area)).toEqual(['223,78 m²', '198,78 m²', '50,00 m²']);
    expect(HACIENDA_F22_BLUEPRINTS.map(plan => plan.metadata?.area)).toEqual(HACIENDA_F22_LEVELS.map(level => level.area));
    expect(f22.bedrooms).toBeUndefined();
    expect(identity.specs.bathrooms).toBeUndefined();
    expect(commercial.parkingSpaces).toBeUndefined();
    expect(publicSpecs.materials).toEqual([]);
    expect(publicSpecs.finishes).toBeUndefined();
    expect(publicSpecs.financials).toBeUndefined();
    expect(HACIENDA_F22_ROOMS_360.every(room => !room.area && !room.materials)).toBe(true);
  });
  it('muestra los 16 datos y no muestra las especificaciones genéricas inventadas', () => {
    const html = renderToStaticMarkup(<ProjectSpecs projectName="HACIENDA F22" specs={getProjectPublicSpecs('HACIENDA F22')} />);
    for (const [, value] of technicalRowGroups(specs).flatMap(group => group.rows)) expect(html).toContain(value);
    expect(html).not.toMatch(/Calacatta|35 MPa|65%|5\.80m|Eficiencia A|Lutron|30%|Suites|1\.200|560 m/);
  });
  it('corrige datos antiguos preservando las rutas, coordenadas, destinos y publicación del recorrido', () => {
    const original = structuredClone(f22);
    const stale = { ...original, areaBuilt: '560 m²', areaLot: '1.200 m²', bedrooms: 4, bathrooms: 5, parkingSpaces: 4, published: true };
    const result = applyF22VerifiedSpecs(stale);
    expect(result.areaBuilt).toBe('514,88 m²');
    expect(result.areaLot).toBe('644,00 m²');
    expect(result.bedrooms).toBeUndefined();
    expect(result.published).toBe(true);
    for (const [id, room] of Object.entries(original.rooms)) {
      expect(result.rooms[id].imageUrl).toBe(room.imageUrl);
      expect(result.rooms[id].floorPlanImage).toBe(room.floorPlanImage);
      expect(result.rooms[id].minimapPosition).toEqual(room.minimapPosition);
      expect(result.rooms[id].hotspots.map(({ id, position, targetRoom }) => ({ id, position, targetRoom }))).toEqual(room.hotspots.map(({ id, position, targetRoom }) => ({ id, position, targetRoom })));
    }
    expect(normalizeProject(stale).technicalSpecs).toEqual(specs);
    expect(stale.areaBuilt).toBe('560 m²');
  });
  it('no modifica otro proyecto ni lo incorpora al catálogo público', async () => {
    const other = projectsData.project_ibiza_a14;
    expect(applyF22VerifiedSpecs(other)).toBe(other);
    vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: false, error: null } as any);
    vi.spyOn(supabase, 'from').mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [], error: null }) } as any);
    expect(await getProjectsFromSupabase()).toEqual([]);
  });
  it('actualiza lecturas y escrituras del registro autorizado aunque la nube aún tenga valores antiguos', async () => {
    vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: true, error: null } as any);
    const upsert = vi.fn().mockResolvedValue({ error: null });
    vi.spyOn(supabase, 'from').mockReturnValue({ upsert, select: vi.fn().mockResolvedValue({ data: [{ id: f22.id, data: { ...f22, areaBuilt: '560 m²' }, published_for_client: false }], error: null }) } as any);
    expect((await getProjectsFromSupabase())[0].areaBuilt).toBe(F22_AREA_BUILT);
    await saveProjectToSupabase({ ...f22, areaBuilt: '560 m²', published: false });
    expect(upsert.mock.calls[0][0].data.technicalSpecs).toEqual(specs);
    expect(upsert.mock.calls[0][0].data.areaBuilt).toBe(F22_AREA_BUILT);
    expect(upsert.mock.calls[0][0].published_for_client).toBe(false);
  });
});

describe('SQL de actualización del contenido F22', () => {
  const sql = readFileSync('supabase/actualizar_especificaciones_hacienda_f22.sql', 'utf8');
  it('puede ejecutarse dos veces sin alterar otros proyectos, publicación ni navegación', async () => {
    const db = new PGlite();
    try {
      await db.exec('CREATE TABLE projects (id text PRIMARY KEY, data jsonb, published_for_client boolean); CREATE TABLE project_media (id text PRIMARY KEY, project_id text, type text, title text, storage_path text, metadata jsonb);');
      const old = { ...f22, areaBuilt: '560 m²', bedrooms: 4 };
      const other = { id: 'other', areaBuilt: '300 m²', bedrooms: 2 };
      await db.query('INSERT INTO projects VALUES ($1,$2,false),($3,$4,true)', [f22.id, JSON.stringify(old), 'other', JSON.stringify(other)]);
      await db.query("INSERT INTO project_media VALUES ('plan', $1, 'blueprint', 'Provisional', $2, '{\"area\":\"340 m²\"}'), ('other-plan', 'other', 'blueprint', 'Otro', '/PLANO.jpg', '{}')", [f22.id, '/HACIENDA F22/360/PLANOS/P1-1.png']);
      await db.exec(sql);
      const first = (await db.query<{ data: Project; published_for_client: boolean }>('SELECT * FROM projects WHERE id=$1', [f22.id])).rows[0];
      expect(first.data.technicalSpecs).toEqual(specs);
      expect(first.data.areaBuilt).toBe(F22_AREA_BUILT);
      expect(first.data.bedrooms).toBeUndefined();
      expect(first.published_for_client).toBe(false);
      for (const [id, room] of Object.entries(f22.rooms)) {
        expect(first.data.rooms[id].imageUrl).toBe(room.imageUrl);
        expect(first.data.rooms[id].hotspots).toEqual(room.hotspots);
      }
      expect((await db.query('SELECT data FROM projects WHERE id=\'other\'')).rows[0].data).toEqual(other);
      expect((await db.query<{ metadata: { area: string } }>("SELECT metadata FROM project_media WHERE id='plan'")).rows[0].metadata.area).toBe('223,78 m²');
      await db.exec(sql);
      expect((await db.query('SELECT data FROM projects WHERE id=$1', [f22.id])).rows[0].data).toEqual(first.data);
      expect((await db.query("SELECT title FROM project_media WHERE id='other-plan'")).rows[0].title).toBe('Otro');
    } finally { await db.close(); }
  }, 20000);
  it('aborta si falta F22', async () => {
    const db = new PGlite();
    try {
      await db.exec('CREATE TABLE projects (id text PRIMARY KEY, data jsonb, published_for_client boolean);');
      await expect(db.exec(sql)).rejects.toThrow('No se encontró el registro único');
    } finally { await db.close(); }
  }, 20000);
});
