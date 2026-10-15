import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService, UserRole } from '../../src/lib/authService';
import { supabase } from '../../src/supabase';

const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
};

if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = createStorageMock() as any;
}
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = createStorageMock() as any;
}

describe('Suite de Autenticación Segura — authService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.sessionStorage.clear();
    globalThis.localStorage.clear();
  });

  describe('Inicio de Sesión (signIn)', () => {
    it('1. Rechaza intentos con campos de correo o contraseña vacíos', async () => {
      const res1 = await authService.signIn('', '123456');
      expect(res1.success).toBe(false);
      expect(res1.error).toMatch(/correo y contraseña/i);

      const res2 = await authService.signIn('test@massa.co', '   ');
      expect(res2.success).toBe(false);
      expect(res2.error).toMatch(/correo y contraseña/i);
    });

    it('2. Inicia sesión correctamente con Supabase Auth y mapea perfil de Arquitecto', async () => {
      const mockUserId = '11111111-1111-4111-8111-111111111111';
      
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: {
          user: {
            id: mockUserId,
            email: 'mateo@massagroup.co',
            user_metadata: { name: 'Mateo Rossi', role: 'architect' },
          } as any,
          session: {} as any,
        },
        error: null,
      });

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({
          data: { id: mockUserId, email: 'mateo@massagroup.co', name: 'Mateo Rossi', role: 'architect' },
          error: null,
        }),
      } as any);

      const res = await authService.signIn('mateo@massagroup.co', 'Secret123!', 'architect');
      expect(res.success).toBe(true);
      expect(res.user?.role).toBe('architect');
      expect(res.user?.name).toBe('Mateo Rossi');
      expect(sessionStorage.getItem('massa_3d_role')).toBe('editor');
    });

    it('3. Impide que un usuario con rol de Cliente ingrese por el panel de Arquitecto', async () => {
      const mockUserId = '22222222-2222-4222-8222-222222222222';
      const signOutSpy = vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({ error: null });

      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: {
          user: {
            id: mockUserId,
            email: 'cliente@gmail.com',
            user_metadata: { name: 'Carlos Mendoza', role: 'client' },
          } as any,
          session: {} as any,
        },
        error: null,
      });

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({
          data: { id: mockUserId, email: 'cliente@gmail.com', name: 'Carlos Mendoza', role: 'client' },
          error: null,
        }),
      } as any);

      const res = await authService.signIn('cliente@gmail.com', 'Secret123!', 'architect');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Acceso Denegado.*CLIENTE/i);
      expect(signOutSpy).toHaveBeenCalled();
    });

    it('4. Impide que un usuario con rol de Arquitecto ingrese por el panel de Cliente', async () => {
      const mockUserId = '11111111-1111-4111-8111-111111111111';
      const signOutSpy = vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({ error: null });

      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: {
          user: {
            id: mockUserId,
            email: 'mateo@massagroup.co',
            user_metadata: { name: 'Mateo Rossi', role: 'architect' },
          } as any,
          session: {} as any,
        },
        error: null,
      });

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({
          data: { id: mockUserId, email: 'mateo@massagroup.co', name: 'Mateo Rossi', role: 'architect' },
          error: null,
        }),
      } as any);

      const res = await authService.signIn('mateo@massagroup.co', 'Secret123!', 'client');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Acceso Denegado.*ARQUITECTO/i);
      expect(signOutSpy).toHaveBeenCalled();
    });

    it('5. Retorna error seguro cuando las credenciales no son válidas', async () => {
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' } as any,
      });

      const res = await authService.signIn('wrong@massa.co', 'wrongpass');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/incorrectas/i);
    });
  });

  describe('Cierre de Sesión (signOut)', () => {
    it('5. Cierra la sesión en Supabase y limpia todo el almacenamiento local', async () => {
      sessionStorage.setItem('massa_3d_role', 'editor');
      sessionStorage.setItem('massa_3d_username', 'mateo@massagroup.co');
      localStorage.setItem('massa_3d_role', 'editor');

      const signOutSpy = vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({ error: null });

      await authService.signOut();

      expect(signOutSpy).toHaveBeenCalled();
      expect(sessionStorage.getItem('massa_3d_role')).toBeNull();
      expect(sessionStorage.getItem('massa_3d_username')).toBeNull();
      expect(localStorage.getItem('massa_3d_role')).toBeNull();
    });
  });

  describe('Recuperación de Contraseña (resetPassword)', () => {
    it('6. Valida que el correo no esté vacío', async () => {
      const res = await authService.resetPassword('');
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/correo electrónico válido/i);
    });

    it('7. Envía solicitud de recuperación de contraseña a Supabase Auth', async () => {
      const resetSpy = vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockResolvedValueOnce({
        data: {},
        error: null,
      });

      const res = await authService.resetPassword('carlos@cliente.com');
      expect(res.success).toBe(true);
      expect(resetSpy).toHaveBeenCalledWith('carlos@cliente.com', expect.any(Object));
      expect(res.message).toMatch(/enlace de recuperación seguro/i);
    });
  });

  describe('Consulta de Sesión Activa (getCurrentUser)', () => {
    it('8. Devuelve null si no existe sesión activa en Supabase', async () => {
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const user = await authService.getCurrentUser();
      expect(user).toBeNull();
    });

    it('9. Devuelve el perfil completo verificado si hay sesión activa', async () => {
      const mockUserId = '11111111-1111-4111-8111-111111111111';

      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: {
          session: {
            user: {
              id: mockUserId,
              email: 'mateo@massagroup.co',
            },
          } as any,
        },
        error: null,
      });

      vi.spyOn(supabase, 'from').mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValueOnce({
          data: { id: mockUserId, email: 'mateo@massagroup.co', name: 'Mateo Rossi', role: 'architect' },
          error: null,
        }),
      } as any);

      const user = await authService.getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.id).toBe(mockUserId);
      expect(user?.role).toBe('architect');
    });
  });
});
