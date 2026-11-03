import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../src/lib/authService';
import { ADMIN_EMAIL } from '../../src/config/adminAccess';
import { supabase } from '../../src/supabase';

const id = '11111111-1111-4111-8111-111111111111';
const profile = { id, email: ADMIN_EMAIL, name: 'Juan David', role: 'admin' };
const storage = () => {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); }, clear: () => values.clear() } as Storage;
};
globalThis.sessionStorage = storage();
globalThis.localStorage = storage();

function mockProfile(value: unknown = profile, error: unknown = null) {
  vi.spyOn(supabase, 'from').mockReturnValue({
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: value, error }),
  } as any);
}
function mockLogin(error: unknown = null) {
  return vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
    data: { user: error ? null : { id, email: ADMIN_EMAIL, user_metadata: { role: 'admin' } }, session: null },
    error,
  } as any);
}
function mockSession(email = ADMIN_EMAIL) {
  vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
    data: { session: { user: { id, email, user_metadata: { role: 'admin' } } } }, error: null,
  } as any);
}
describe('Acceso a una sola cuenta con identidad verificada', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    sessionStorage.clear(); localStorage.clear();
    vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null });
    vi.spyOn(supabase, 'rpc').mockResolvedValue({ data: true, error: null } as any);
  });
  it('rechaza campos vacios sin consultar Auth', async () => {
    const login = mockLogin();
    expect((await authService.signIn('', 'secret')).success).toBe(false);
    expect((await authService.signIn(ADMIN_EMAIL, '  ')).success).toBe(false);
    expect(login).not.toHaveBeenCalled();
  });
  it.each(['admin@massagroup.co', 'mateo@massagroup.co', 'otro@gmail.com'])('rechaza otra cuenta: %s', async email => {
    const login = mockLogin();
    expect((await authService.signIn(email, 'Secret123!', 'architect')).success).toBe(false);
    expect(login).not.toHaveBeenCalled();
  });
  it('no permite login por un perfil de cliente', async () => {
    expect((await authService.signIn(ADMIN_EMAIL, 'Secret123!', 'client')).success).toBe(false);
  });
  it('acepta solo Auth, perfil admin y autorizacion del servidor coincidentes', async () => {
    const login = mockLogin(); mockProfile();
    const result = await authService.signIn('  ' + ADMIN_EMAIL.toUpperCase() + '  ', '  Secret123!  ', 'architect');
    expect(result).toEqual({ success: true, user: profile });
    expect(login).toHaveBeenCalledWith({ email: ADMIN_EMAIL, password: '  Secret123!  ' });
    expect(supabase.rpc).toHaveBeenCalledWith('is_platform_admin');
    expect(sessionStorage.getItem('massa_3d_role')).toBeNull();
  });
  it.each(['admin', 'admin123', 'massa2025', 'massa', '123456'])('no usa la contrasena alternativa %s', async password => {
    mockLogin({ message: 'Invalid login credentials' });
    expect((await authService.signIn(ADMIN_EMAIL, password, 'architect')).success).toBe(false);
    expect(sessionStorage.getItem('massa_3d_name')).toBeNull();
  });
  it.each([null, { ...profile, role: 'client' }, { ...profile, role: 'architect' },
    { ...profile, id: 'otro-id' }, { ...profile, email: 'otra@empresa.com' }])('rechaza perfil ausente o no autorizado %#', async value => {
    mockLogin(); mockProfile(value);
    expect((await authService.signIn(ADMIN_EMAIL, 'Secret123!', 'architect')).success).toBe(false);
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
  it('no utiliza metadatos de Auth si la lectura del perfil falla', async () => {
    mockLogin(); mockProfile(null, { message: 'RLS error' });
    expect((await authService.signIn(ADMIN_EMAIL, 'Secret123!')).success).toBe(false);
  });
  it.each([{ data: false, error: null }, { data: null, error: { message: 'RPC unavailable' } }])('falla de forma cerrada si el servidor no autoriza %#', async value => {
    mockLogin(); mockProfile();
    vi.mocked(supabase.rpc).mockResolvedValue(value as any);
    expect((await authService.signIn(ADMIN_EMAIL, 'Secret123!')).success).toBe(false);
  });
  it('no recupera privilegios desde almacenamiento sin sesion', async () => {
    sessionStorage.setItem('massa_3d_role', 'editor');
    localStorage.setItem('massa_3d_user_level', 'admin');
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({ data: { session: null }, error: null });
    expect(await authService.getCurrentUser()).toBeNull();
  });
  it('no recupera privilegios desde metadatos cuando falta el perfil', async () => {
    mockSession(); mockProfile(null);
    expect(await authService.getCurrentUser()).toBeNull();
  });
  it('devuelve el perfil autorizado de la sesion actual', async () => {
    mockSession(); mockProfile();
    expect(await authService.getCurrentUser()).toEqual(profile);
  });
  it('no admite otras sesiones aunque tengan metadatos admin', async () => {
    mockSession('otro@massagroup.co'); mockProfile();
    expect(await authService.getCurrentUser()).toBeNull();
  });
  it('limpia indicadores locales al salir', async () => {
    localStorage.setItem('massa_3d_role', 'editor');
    sessionStorage.setItem('massa_3d_name', 'Juan');
    await authService.signOut();
    expect(localStorage.getItem('massa_3d_role')).toBeNull();
    expect(sessionStorage.getItem('massa_3d_name')).toBeNull();
  });
  it('solicita recuperacion solo para la cuenta autorizada', async () => {
    const reset = vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockResolvedValue({ data: {}, error: null });
    expect((await authService.resetPassword('')).success).toBe(false);
    expect((await authService.resetPassword('otra@gmail.com')).success).toBe(false);
    expect((await authService.resetPassword(ADMIN_EMAIL)).success).toBe(true);
    expect(reset).toHaveBeenCalledTimes(1);
  });
  it('consulta el perfil fuera del callback de Auth y cancela al desuscribir', async () => {
    vi.useFakeTimers();
    let listener: any;
    const unsubscribe = vi.fn();
    vi.spyOn(supabase.auth, 'onAuthStateChange').mockImplementation(callback => {
      listener = callback; return { data: { subscription: { unsubscribe } } } as any;
    });
    const get = vi.spyOn(authService, 'getCurrentUser').mockResolvedValue(profile as any);
    const callback = vi.fn();
    const connection = authService.onAuthStateChange(callback);
    listener('SIGNED_IN', { user: { id } });
    expect(get).not.toHaveBeenCalled();
    connection.data.subscription.unsubscribe();
    await vi.runAllTimersAsync();
    expect(get).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
