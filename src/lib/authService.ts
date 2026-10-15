import { supabase } from '../supabase';

export type UserRole = 'architect' | 'client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  error?: string;
}

// Bandera atómica para evitar que onAuthStateChange desmonte la pantalla de Login
// antes de que signIn termine de validar la segregación de roles.
let isAuthenticating = false;

/**
 * Servicio centralizado de Autenticación de MASSA VIEW basado en Supabase Auth
 */
export const authService = {
  /**
   * Inicia sesión con credenciales oficiales (Email y Contraseña) en Supabase Auth
   * y valida el perfil corporativo en public.user_profiles con RLS.
   */
  async signIn(
    email: string,
    password: string,
    targetRole?: 'architect' | 'client'
  ): Promise<AuthResult> {
    let cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Por favor ingresa correo y contraseña.' };
    }

    if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail}@massagroup.co`;
    }

    isAuthenticating = true;
    try {
      // 1. Autenticar contra Supabase Auth oficial
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError || !data?.user) {
        // En caso de que el usuario haya escrito un username en vez de email (migración progresiva)
        return {
          success: false,
          error: authError?.message === 'Invalid login credentials'
            ? 'Credenciales incorrectas o la cuenta no existe.'
            : (authError?.message || 'Error al iniciar sesión.'),
        };
      }

      const authUser = data.user;

      // 2. Obtener el perfil corporativo verificado desde public.user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.warn('Advertencia al consultar user_profiles:', profileError.message);
      }

      // Si existe perfil en la base de datos, validar rol
      let role: UserRole = profile?.role || (authUser.user_metadata?.role as UserRole);
      let name: string = profile?.name || authUser.user_metadata?.name;

      // Provisionar automáticamente al Administrador Principal si aún no tiene registro en user_profiles
      if ((!profile || profile.role !== 'architect') && cleanEmail === 'juandavidfigueroa4@gmail.com') {
        role = 'architect';
        name = name || 'Juan David Figueroa';
        try {
          await supabase.from('user_profiles').upsert({
            id: authUser.id,
            email: cleanEmail,
            name,
            role: 'architect',
          });
        } catch {
          // ignore
        }
      } else {
        if (!role) role = 'client';
        if (!name) name = authUser.email?.split('@')[0] || 'Usuario MASSA';
      }

      // 3. Verificación estricta de segregación de roles bidireccional
      if (targetRole === 'architect' && role !== 'architect') {
        await supabase.auth.signOut();
        return {
          success: false,
          error: `Acceso Denegado: La cuenta "${name}" está registrada como CLIENTE y no tiene permisos para el Portal de Arquitecto. Por favor selecciona la pestaña "Cliente".`,
        };
      }

      if (targetRole === 'client' && role !== 'client') {
        await supabase.auth.signOut();
        return {
          success: false,
          error: `Acceso Denegado: La cuenta "${name}" está registrada como ARQUITECTO y no puede ingresar por el Portal de Cliente. Por favor selecciona la pestaña "Arquitecto".`,
        };
      }

      // Sincronizar estado local para componentes que lo consumen
      try {
        sessionStorage.setItem('massa_3d_role', role === 'architect' ? 'editor' : 'visitor');
        sessionStorage.setItem('massa_3d_username', cleanEmail);
        sessionStorage.setItem('massa_3d_name', name);
        sessionStorage.setItem('massa_3d_user_level', role);

        localStorage.setItem('massa_3d_role', role === 'architect' ? 'editor' : 'visitor');
        localStorage.setItem('massa_3d_username', cleanEmail);
        localStorage.setItem('massa_3d_name', name);
        localStorage.setItem('massa_3d_user_level', role);
      } catch {
        // ignore
      }

      return {
        success: true,
        user: {
          id: authUser.id,
          email: cleanEmail,
          name,
          role,
        },
      };
    } catch (err: any) {
      console.error('Error en autenticación:', err);
      return {
        success: false,
        error: err.message || 'Error de conexión durante el inicio de sesión.',
      };
    } finally {
      isAuthenticating = false;
    }
  },

  /**
   * Cierra la sesión activa en Supabase Auth y limpia almacenamiento local
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error al cerrar sesión en Supabase Auth:', err);
    } finally {
      sessionStorage.removeItem('massa_3d_role');
      sessionStorage.removeItem('massa_client_email');
      sessionStorage.removeItem('massa_3d_username');
      sessionStorage.removeItem('massa_3d_name');
      sessionStorage.removeItem('massa_3d_user_level');

      try {
        localStorage.removeItem('massa_3d_role');
        localStorage.removeItem('massa_client_email');
        localStorage.removeItem('massa_3d_username');
        localStorage.removeItem('massa_3d_name');
        localStorage.removeItem('massa_3d_user_level');
      } catch {
        // ignore
      }
    }
  },

  /**
   * Envía enlace de recuperación de contraseña al correo del usuario
   */
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Por favor ingresa un correo electrónico válido.' };
    }

    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : '';
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl || undefined,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: `Se ha enviado un enlace de recuperación seguro a ${cleanEmail}. Por favor revisa tu bandeja de entrada.`,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error solicitando recuperación de contraseña.' };
    }
  },

  /**
   * Obtiene la sesión activa actual y su perfil verificado
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) return profile as UserProfile;

      return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || 'Usuario MASSA',
        role: (session.user.user_metadata?.role as UserRole) || 'client',
      };
    } catch {
      return null;
    }
  },

  /**
   * Escucha cambios en el estado de autenticación (Login, Logout, Token Refreshed)
   */
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      // Ignorar eventos intermedios durante el proceso de validación de signIn
      // para evitar desmontar LoginScreen o parpadear entre vistas
      if (isAuthenticating) return;

      if (session?.user) {
        const profile = await authService.getCurrentUser();
        callback(profile);
      } else {
        callback(null);
      }
    });
  },
};
