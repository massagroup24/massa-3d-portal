import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjectsFromSupabase, saveProjectToSupabase, verifyUserLogin, saveMassaUser, deleteMassaUser, supabase, supabaseUrl } from '../../src/supabase';
import { authService } from '../../src/lib/authService';
import { normalizeProject, type Project } from '../../src/data/tourData';

describe('Selección de catálogo y persistencia de publicación', () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  it.each([true, false, null])('consulta la fuente autorizada según el servidor: %s', async allowed => {
    vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: allowed, error: null } as any);
    const select = vi.fn().mockResolvedValue({ data: [{ id: 'A', data: { id: 'A', name: 'Proyecto A' }, published_for_client: true }], error: null });
    const from = vi.spyOn(supabase, 'from').mockReturnValue({ select } as any);
    const rows = await getProjectsFromSupabase();
    expect(from).toHaveBeenCalledWith(allowed === true ? 'projects' : 'public_projects');
    expect(rows[0].published).toBe(true);
    expect(normalizeProject(rows[0]).published).toBe(true);
  });
  it('no sustituye un catálogo vacío por proyectos compilados o borradores locales', async () => {
    vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: false, error: null } as any);
    vi.spyOn(supabase, 'from').mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [], error: null }) } as any);
    expect(await getProjectsFromSupabase()).toEqual([]);
  });
  it('propaga fallos de lectura sin retornar proyectos ocultos', async () => {
    vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: null, error: { message: 'offline' } } as any);
    const from = vi.spyOn(supabase, 'from').mockReturnValue({ select: vi.fn().mockResolvedValue({ data: null, error: { message: 'offline' } }) } as any);
    await expect(getProjectsFromSupabase()).rejects.toThrow();
    expect(from).toHaveBeenCalledWith('public_projects');
  });
  it.each([true, false, undefined])('guarda la publicación explícitamente sin persistir firmas: %s', async published => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    vi.spyOn(supabase, 'from').mockReturnValue({ upsert } as any);
    const data = { id: 'A', published, thumbnail: supabaseUrl + '/storage/v1/object/sign/tour-images/projects/A/img.jpg?token=secret' } as Project;
    await saveProjectToSupabase(data);
    const stored = upsert.mock.calls[0][0];
    expect(stored.published_for_client).toBe(published === true);
    expect(stored.data.thumbnail).not.toContain('token=');
    expect(normalizeProject({ ...data, published }).published).toBe(published === true);
  });
  it('el acceso heredado delega en Auth y no consulta contraseñas en tablas', async () => {
    const login = vi.spyOn(authService, 'signIn').mockResolvedValue({ success: false, error: 'denied' });
    const from = vi.spyOn(supabase, 'from');
    expect((await verifyUserLogin('juan', 'legacy', 'architect')).success).toBe(false);
    expect(login).toHaveBeenCalledWith('juan', 'legacy', 'architect');
    expect(from).not.toHaveBeenCalled();
  });
  it('no admite altas ni bajas de cuentas desde el navegador', async () => {
    const from = vi.spyOn(supabase, 'from');
    await expect(saveMassaUser({ username: 'otra@example.com', name: 'Otra' })).rejects.toThrow();
    await expect(deleteMassaUser('owner-id')).rejects.toThrow();
    expect(from).not.toHaveBeenCalled();
  });
});
